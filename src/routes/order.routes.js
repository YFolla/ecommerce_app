const express = require('express');
const router = express.Router();
const { checkout, getOrders, getOrderById } = require('../controllers/order.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /cart/{cartId}/checkout:
 *   post:
 *     tags: [Orders]
 *     summary: Process checkout and create order from cart
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
 *               - shippingAddress
 *             properties:
 *               shippingAddress:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created successfully
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
 *                     orderId:
 *                       type: string
 *                       format: uuid
 *                     totalAmount:
 *                       type: number
 *                     status:
 *                       type: string
 *       400:
 *         description: Cart is empty or insufficient stock
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: Cart not found
 */
router.post('/:cartId/checkout', isAuthenticated, checkout);

/**
 * @swagger
 * /orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get user's order history
 *     security:
 *       - session: []
 *     responses:
 *       200:
 *         description: List of user's orders
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
 *                       status:
 *                         type: string
 *                       total_amount:
 *                         type: number
 *                       shipping_address:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       total_items:
 *                         type: integer
 *       401:
 *         description: Not authenticated
 */
router.get('/', isAuthenticated, getOrders);

/**
 * @swagger
 * /orders/{orderId}:
 *   get:
 *     tags: [Orders]
 *     summary: Get specific order details
 *     security:
 *       - session: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order details with items
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
 *                     status:
 *                       type: string
 *                     total_amount:
 *                       type: number
 *                     shipping_address:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                           quantity:
 *                             type: integer
 *                           price_at_time:
 *                             type: number
 *                           name:
 *                             type: string
 *                           image_url:
 *                             type: string
 *                           total_price:
 *                             type: number
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Access denied
 *       404:
 *         description: Order not found
 */
router.get('/:orderId', isAuthenticated, getOrderById);

module.exports = router; 