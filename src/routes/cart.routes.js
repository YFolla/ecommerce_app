const express = require('express');
const router = express.Router();
const { createCart, getCart, addCartItem, updateCartItem, removeCartItem } = require('../controllers/cart.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /cart:
 *   post:
 *     tags: [Cart]
 *     summary: Create a new cart or get existing cart
 *     security:
 *       - session: []
 *     responses:
 *       201:
 *         description: Cart created successfully
 *       200:
 *         description: Existing cart returned
 *       401:
 *         description: Not authenticated
 */
router.post('/', isAuthenticated, createCart);

/**
 * @swagger
 * /cart/{cartId}:
 *   get:
 *     tags: [Cart]
 *     summary: Get cart details with items
 *     security:
 *       - session: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Cart details with items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           product_id:
 *                             type: string
 *                             format: uuid
 *                           name:
 *                             type: string
 *                           price:
 *                             type: number
 *                           quantity:
 *                             type: integer
 *                           total_price:
 *                             type: number
 *                           image_url:
 *                             type: string
 *                     total_items:
 *                       type: integer
 *                     total_amount:
 *                       type: number
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Cart not found
 */
router.get('/:cartId', isAuthenticated, getCart);

/**
 * @swagger
 * /cart/{cartId}/items:
 *   post:
 *     tags: [Cart]
 *     summary: Add item to cart
 *     security:
 *       - session: []
 *     parameters:
 *       - in: path
 *         name: cartId
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
 *             required:
 *               - productId
 *               - quantity
 *             properties:
 *               productId:
 *                 type: string
 *                 format: uuid
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 *       400:
 *         description: Invalid input or not enough stock
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Cart or product not found
 */
router.post('/:cartId/items', isAuthenticated, addCartItem);

/**
 * @swagger
 * /cart/{cartId}/items/{itemId}:
 *   put:
 *     tags: [Cart]
 *     summary: Update cart item quantity
 *     security:
 *       - session: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
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
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Cart item updated successfully
 *       400:
 *         description: Invalid input or not enough stock
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Cart item not found
 */
router.put('/:cartId/items/:itemId', isAuthenticated, updateCartItem);

/**
 * @swagger
 * /cart/{cartId}/items/{itemId}:
 *   delete:
 *     tags: [Cart]
 *     summary: Remove item from cart
 *     security:
 *       - session: []
 *     parameters:
 *       - in: path
 *         name: cartId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Item removed from cart successfully
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Cart item not found
 */
router.delete('/:cartId/items/:itemId', isAuthenticated, removeCartItem);

module.exports = router; 