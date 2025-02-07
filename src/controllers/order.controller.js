const db = require('../config/database');

// Process checkout and create order
const checkout = async (req, res) => {
    const { cartId } = req.params;
    const { shippingAddress } = req.body;

    // Start a transaction
    const client = await db.getClient();
    try {
        await client.query('BEGIN');

        // Verify cart exists and belongs to user
        const cart = await client.query(
            `SELECT c.id, c.user_id
             FROM carts c
             WHERE c.id = $1 AND c.user_id = $2`,
            [cartId, req.user.id]
        );

        if (cart.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                status: 'error',
                message: 'Cart not found'
            });
        }

        // Get cart items with product details
        const cartItems = await client.query(
            `SELECT 
                ci.quantity,
                ci.product_id,
                p.price,
                p.stock_quantity,
                p.name
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = $1`,
            [cartId]
        );

        if (cartItems.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                status: 'error',
                message: 'Cart is empty'
            });
        }

        // Verify stock and calculate total
        let totalAmount = 0;
        const stockUpdates = [];
        const orderItems = [];

        for (const item of cartItems.rows) {
            if (item.stock_quantity < item.quantity) {
                await client.query('ROLLBACK');
                return res.status(400).json({
                    status: 'error',
                    message: `Not enough stock available for ${item.name}`
                });
            }

            totalAmount += parseFloat(item.price) * item.quantity;
            stockUpdates.push(client.query(
                'UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            ));
            orderItems.push({
                product_id: item.product_id,
                quantity: item.quantity,
                price_at_time: item.price
            });
        }

        // Create order
        const orderResult = await client.query(
            `INSERT INTO orders (user_id, status, total_amount, shipping_address)
             VALUES ($1, $2, $3, $4)
             RETURNING id`,
            [req.user.id, 'pending', totalAmount, shippingAddress]
        );

        const orderId = orderResult.rows[0].id;

        // Create order items
        for (const item of orderItems) {
            await client.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price_at_time)
                 VALUES ($1, $2, $3, $4)`,
                [orderId, item.product_id, item.quantity, item.price_at_time]
            );
        }

        // Update stock quantities
        await Promise.all(stockUpdates);

        // Delete cart items
        await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
        
        // Delete cart
        await client.query('DELETE FROM carts WHERE id = $1', [cartId]);

        await client.query('COMMIT');

        res.status(201).json({
            status: 'success',
            data: {
                orderId,
                totalAmount,
                status: 'pending'
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error processing checkout:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error processing checkout'
        });
    } finally {
        client.release();
    }
};

// Get user's order history
const getOrders = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT 
                o.id,
                o.status,
                o.total_amount,
                o.shipping_address,
                o.created_at,
                COUNT(oi.id) as total_items
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.user_id = $1
             GROUP BY o.id
             ORDER BY o.created_at DESC`,
            [req.user.id]
        );

        res.json({
            status: 'success',
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching orders'
        });
    }
};

// Get specific order details
const getOrderById = async (req, res) => {
    const { orderId } = req.params;

    try {
        // Get order details
        const orderResult = await db.query(
            `SELECT 
                o.id,
                o.status,
                o.total_amount,
                o.shipping_address,
                o.created_at,
                o.user_id
             FROM orders o
             WHERE o.id = $1`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Order not found'
            });
        }

        // Verify order ownership
        if (orderResult.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }

        // Get order items
        const itemsResult = await db.query(
            `SELECT 
                oi.id,
                oi.quantity,
                oi.price_at_time,
                p.name,
                p.image_url,
                (oi.quantity * oi.price_at_time) as total_price
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = $1`,
            [orderId]
        );

        const order = {
            ...orderResult.rows[0],
            items: itemsResult.rows
        };

        res.json({
            status: 'success',
            data: order
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching order'
        });
    }
};

module.exports = {
    checkout,
    getOrders,
    getOrderById
}; 