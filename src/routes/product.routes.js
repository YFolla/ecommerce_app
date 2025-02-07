const express = require('express');
const router = express.Router();
const { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Category ID to filter products
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       category_id:
 *                         type: string
 *                         format: uuid
 *                       category_name:
 *                         type: string
 *                       stock_quantity:
 *                         type: integer
 *                       image_url:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /products/{productId}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by ID
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:productId', getProductById);

/**
 * @swagger
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a new product (admin only)
 *     security:
 *       - session: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stockQuantity
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               stockQuantity:
 *                 type: integer
 *                 minimum: 0
 *               imageUrl:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.post('/', isAuthenticated, isAdmin, createProduct);

/**
 * @swagger
 * /products/{productId}:
 *   put:
 *     tags: [Products]
 *     summary: Update a product (admin only)
 *     security:
 *       - session: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 minimum: 0
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               stockQuantity:
 *                 type: integer
 *                 minimum: 0
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 */
router.put('/:productId', isAuthenticated, isAdmin, updateProduct);

/**
 * @swagger
 * /products/{productId}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product (admin only)
 *     security:
 *       - session: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Product not found
 */
router.delete('/:productId', isAuthenticated, isAdmin, deleteProduct);

module.exports = router; 