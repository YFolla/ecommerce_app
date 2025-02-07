const express = require('express');
const router = express.Router();
const { register, login, logout, getCurrentUser } = require('../controllers/auth.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: User successfully registered
 *       400:
 *         description: Email already exists
 */
router.post('/register', register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     security:
 *       - session: []
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       401:
 *         description: Not authenticated
 */
router.post('/logout', isAuthenticated, logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user information
 *     security:
 *       - session: []
 *     responses:
 *       200:
 *         description: Current user information
 *       401:
 *         description: Not authenticated
 */
router.get('/me', isAuthenticated, getCurrentUser);

module.exports = router; 