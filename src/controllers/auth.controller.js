const bcrypt = require('bcryptjs');
const db = require('../config/database');
const passport = require('passport');

const register = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;

    try {
        // Check if user already exists
        const userExists = await db.query(
            'SELECT * FROM users WHERE email = $1',
            [email.toLowerCase()]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                status: 'error',
                message: 'User with this email already exists'
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create new user
        const result = await db.query(
            `INSERT INTO users (email, password_hash, first_name, last_name)
             VALUES ($1, $2, $3, $4)
             RETURNING id, email, first_name, last_name, role`,
            [email.toLowerCase(), passwordHash, firstName, lastName]
        );

        const user = result.rows[0];

        // Log in the user after registration
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({
                    status: 'error',
                    message: 'Error logging in after registration'
                });
            }
            return res.status(201).json({
                status: 'success',
                data: user
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error registering user'
        });
    }
};

const login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }

        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: info.message || 'Invalid credentials'
            });
        }

        req.login(user, (err) => {
            if (err) {
                return next(err);
            }

            return res.json({
                status: 'success',
                data: user
            });
        });
    })(req, res, next);
};

const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Error logging out'
            });
        }
        res.json({
            status: 'success',
            message: 'Successfully logged out'
        });
    });
};

const getCurrentUser = (req, res) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({
            status: 'error',
            message: 'Not authenticated'
        });
    }

    res.json({
        status: 'success',
        data: req.user
    });
};

module.exports = {
    register,
    login,
    logout,
    getCurrentUser
}; 