const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById, updateUser } = require('../controllers/user.controller');
const { isAuthenticated, isAdmin } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Get all users (admin only)
 *     security:
 *       - session: []
 *     responses:
 *       200:
 *         description: List of all users
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
 *                       email:
 *                         type: string
 *                       first_name:
 *                         type: string
 *                       last_name:
 *                         type: string
 *                       role:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 */
router.get('/', isAuthenticated, isAdmin, getAllUsers);

/**
 * @swagger
 * /users/{userId}:
 *   get:
 *     tags: [Users]
 *     summary: Get user by ID
 *     security:
 *       - session: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.get('/:userId', isAuthenticated, getUserById);

/**
 * @swagger
 * /users/{userId}:
 *   put:
 *     tags: [Users]
 *     summary: Update user
 *     security:
 *       - session: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input or email already exists
 *       401:
 *         description: Not authenticated or incorrect current password
 *       403:
 *         description: Not authorized
 *       404:
 *         description: User not found
 */
router.put('/:userId', isAuthenticated, updateUser);

module.exports = router; 