const db = require('../config/database');

// Create a new cart
const createCart = async (req, res) => {
    try {
        // Check if user already has an active cart
        const existingCart = await db.query(
            'SELECT id FROM carts WHERE user_id = $1',
            [req.user.id]
        );

        if (existingCart.rows.length > 0) {
            return res.json({
                status: 'success',
                data: { id: existingCart.rows[0].id }
            });
        }

        // Create new cart
        const result = await db.query(
            'INSERT INTO carts (user_id) VALUES ($1) RETURNING id',
            [req.user.id]
        );

        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating cart:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating cart'
        });
    }
};

// Get cart details
const getCart = async (req, res) => {
    const { cartId } = req.params;

    try {
        // Get cart and verify ownership
        const cart = await db.query(
            'SELECT id, user_id FROM carts WHERE id = $1',
            [cartId]
        );

        if (cart.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Cart not found'
            });
        }

        // Verify cart ownership
        if (cart.rows[0].user_id !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }

        // Get cart items with product details
        const cartItems = await db.query(
            `SELECT 
                ci.id,
                ci.quantity,
                p.id as product_id,
                p.name,
                p.price,
                p.image_url,
                (p.price * ci.quantity) as total_price
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = $1`,
            [cartId]
        );

        // Calculate cart totals
        const totalItems = cartItems.rows.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = cartItems.rows.reduce((sum, item) => sum + parseFloat(item.total_price), 0);

        res.json({
            status: 'success',
            data: {
                id: cartId,
                items: cartItems.rows,
                total_items: totalItems,
                total_amount: totalAmount
            }
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching cart'
        });
    }
};

// Add item to cart
const addCartItem = async (req, res) => {
    const { cartId } = req.params;
    const { productId, quantity } = req.body;

    try {
        // Validate quantity
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'Quantity must be greater than 0'
            });
        }

        // Verify cart ownership
        const cart = await db.query(
            'SELECT user_id FROM carts WHERE id = $1',
            [cartId]
        );

        if (cart.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Cart not found'
            });
        }

        if (cart.rows[0].user_id !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }

        // Check product existence and stock
        const product = await db.query(
            'SELECT stock_quantity FROM products WHERE id = $1',
            [productId]
        );

        if (product.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        if (product.rows[0].stock_quantity < quantity) {
            return res.status(400).json({
                status: 'error',
                message: 'Not enough stock available'
            });
        }

        // Check if product already in cart
        const existingItem = await db.query(
            'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
            [cartId, productId]
        );

        let result;
        if (existingItem.rows.length > 0) {
            // Update existing item quantity
            const newQuantity = existingItem.rows[0].quantity + quantity;
            if (newQuantity > product.rows[0].stock_quantity) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Not enough stock available'
                });
            }

            result = await db.query(
                `UPDATE cart_items 
                 SET quantity = quantity + $1, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2
                 RETURNING *`,
                [quantity, existingItem.rows[0].id]
            );
        } else {
            // Add new item to cart
            result = await db.query(
                `INSERT INTO cart_items (cart_id, product_id, quantity)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
                [cartId, productId, quantity]
            );
        }

        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error adding item to cart:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error adding item to cart'
        });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    const { cartId, itemId } = req.params;
    const { quantity } = req.body;

    try {
        // Validate quantity
        if (!quantity || quantity < 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Quantity must be greater than or equal to 0'
            });
        }

        // Verify cart ownership and item existence
        const cartItem = await db.query(
            `SELECT ci.*, c.user_id, p.stock_quantity
             FROM cart_items ci
             JOIN carts c ON ci.cart_id = c.id
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = $1 AND ci.id = $2`,
            [cartId, itemId]
        );

        if (cartItem.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Cart item not found'
            });
        }

        if (cartItem.rows[0].user_id !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }

        if (quantity > cartItem.rows[0].stock_quantity) {
            return res.status(400).json({
                status: 'error',
                message: 'Not enough stock available'
            });
        }

        let result;
        if (quantity === 0) {
            // Remove item if quantity is 0
            result = await db.query(
                'DELETE FROM cart_items WHERE id = $1 RETURNING *',
                [itemId]
            );
        } else {
            // Update quantity
            result = await db.query(
                `UPDATE cart_items 
                 SET quantity = $1, updated_at = CURRENT_TIMESTAMP
                 WHERE id = $2
                 RETURNING *`,
                [quantity, itemId]
            );
        }

        res.json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating cart item'
        });
    }
};

// Remove item from cart
const removeCartItem = async (req, res) => {
    const { cartId, itemId } = req.params;

    try {
        // Verify cart ownership and item existence
        const cartItem = await db.query(
            `SELECT ci.id, c.user_id
             FROM cart_items ci
             JOIN carts c ON ci.cart_id = c.id
             WHERE ci.cart_id = $1 AND ci.id = $2`,
            [cartId, itemId]
        );

        if (cartItem.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Cart item not found'
            });
        }

        if (cartItem.rows[0].user_id !== req.user.id) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }

        await db.query(
            'DELETE FROM cart_items WHERE id = $1',
            [itemId]
        );

        res.json({
            status: 'success',
            message: 'Item removed from cart'
        });
    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error removing cart item'
        });
    }
};

module.exports = {
    createCart,
    getCart,
    addCartItem,
    updateCartItem,
    removeCartItem
}; 