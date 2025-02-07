const db = require('../config/database');

// Get all products with optional category filter
const getAllProducts = async (req, res) => {
    try {
        const { category } = req.query;
        let query = `
            SELECT p.*, c.name as category_name 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
        `;
        const queryParams = [];

        if (category) {
            query += ' WHERE c.id = $1';
            queryParams.push(category);
        }

        query += ' ORDER BY p.created_at DESC';

        const result = await db.query(query, queryParams);

        res.json({
            status: 'success',
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching products'
        });
    }
};

// Get product by ID
const getProductById = async (req, res) => {
    const { productId } = req.params;

    try {
        const result = await db.query(
            `SELECT p.*, c.name as category_name 
             FROM products p
             LEFT JOIN categories c ON p.category_id = c.id
             WHERE p.id = $1`,
            [productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        res.json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching product'
        });
    }
};

// Create new product (admin only)
const createProduct = async (req, res) => {
    const { name, description, price, categoryId, stockQuantity, imageUrl } = req.body;

    try {
        // Validate price and stock quantity
        if (price < 0 || stockQuantity < 0) {
            return res.status(400).json({
                status: 'error',
                message: 'Price and stock quantity must be non-negative'
            });
        }

        // Check if category exists if provided
        if (categoryId) {
            const categoryExists = await db.query(
                'SELECT id FROM categories WHERE id = $1',
                [categoryId]
            );

            if (categoryExists.rows.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid category ID'
                });
            }
        }

        const result = await db.query(
            `INSERT INTO products (name, description, price, category_id, stock_quantity, image_url)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [name, description, price, categoryId, stockQuantity, imageUrl]
        );

        res.status(201).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error creating product'
        });
    }
};

// Update product (admin only)
const updateProduct = async (req, res) => {
    const { productId } = req.params;
    const { name, description, price, categoryId, stockQuantity, imageUrl } = req.body;

    try {
        // Check if product exists
        const productExists = await db.query(
            'SELECT id FROM products WHERE id = $1',
            [productId]
        );

        if (productExists.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        // Validate price and stock quantity if provided
        if ((price !== undefined && price < 0) || (stockQuantity !== undefined && stockQuantity < 0)) {
            return res.status(400).json({
                status: 'error',
                message: 'Price and stock quantity must be non-negative'
            });
        }

        // Check if category exists if provided
        if (categoryId) {
            const categoryExists = await db.query(
                'SELECT id FROM categories WHERE id = $1',
                [categoryId]
            );

            if (categoryExists.rows.length === 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid category ID'
                });
            }
        }

        // Build update query
        let updateFields = [];
        let queryParams = [];
        let paramCount = 1;

        if (name !== undefined) {
            updateFields.push(`name = $${paramCount}`);
            queryParams.push(name);
            paramCount++;
        }

        if (description !== undefined) {
            updateFields.push(`description = $${paramCount}`);
            queryParams.push(description);
            paramCount++;
        }

        if (price !== undefined) {
            updateFields.push(`price = $${paramCount}`);
            queryParams.push(price);
            paramCount++;
        }

        if (categoryId !== undefined) {
            updateFields.push(`category_id = $${paramCount}`);
            queryParams.push(categoryId);
            paramCount++;
        }

        if (stockQuantity !== undefined) {
            updateFields.push(`stock_quantity = $${paramCount}`);
            queryParams.push(stockQuantity);
            paramCount++;
        }

        if (imageUrl !== undefined) {
            updateFields.push(`image_url = $${paramCount}`);
            queryParams.push(imageUrl);
            paramCount++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No fields to update'
            });
        }

        // Add productId to params array
        queryParams.push(productId);

        const query = `
            UPDATE products 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $${paramCount}
            RETURNING *
        `;

        const result = await db.query(query, queryParams);

        res.json({
            status: 'success',
            data: result.rows[0],
            message: 'Product updated successfully'
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating product'
        });
    }
};

// Delete product (admin only)
const deleteProduct = async (req, res) => {
    const { productId } = req.params;

    try {
        const result = await db.query(
            'DELETE FROM products WHERE id = $1 RETURNING id',
            [productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting product'
        });
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}; 