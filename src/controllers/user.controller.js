const db = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users ORDER BY created_at DESC'
        );

        res.json({
            status: 'success',
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching users'
        });
    }
};

// Get user by ID
const getUserById = async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await db.query(
            'SELECT id, email, first_name, last_name, role, created_at, updated_at FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Only allow users to view their own profile unless they're an admin
        if (req.user.role !== 'admin' && req.user.id !== userId) {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied'
            });
        }

        res.json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user'
        });
    }
};

// Update user
const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { firstName, lastName, email, password, currentPassword } = req.body;

    // Only allow users to update their own profile unless they're an admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
        return res.status(403).json({
            status: 'error',
            message: 'Access denied'
        });
    }

    try {
        // Start building the query
        let updateFields = [];
        let queryParams = [];
        let paramCount = 1;

        // Add fields to update if they're provided
        if (firstName) {
            updateFields.push(`first_name = $${paramCount}`);
            queryParams.push(firstName);
            paramCount++;
        }

        if (lastName) {
            updateFields.push(`last_name = $${paramCount}`);
            queryParams.push(lastName);
            paramCount++;
        }

        if (email) {
            // Check if email is already taken by another user
            const emailCheck = await db.query(
                'SELECT id FROM users WHERE email = $1 AND id != $2',
                [email.toLowerCase(), userId]
            );

            if (emailCheck.rows.length > 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Email already in use'
                });
            }

            updateFields.push(`email = $${paramCount}`);
            queryParams.push(email.toLowerCase());
            paramCount++;
        }

        // If password is being updated, verify current password first
        if (password) {
            if (!currentPassword) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Current password is required to update password'
                });
            }

            // Verify current password
            const user = await db.query(
                'SELECT password_hash FROM users WHERE id = $1',
                [userId]
            );

            const isMatch = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
            if (!isMatch) {
                return res.status(401).json({
                    status: 'error',
                    message: 'Current password is incorrect'
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            updateFields.push(`password_hash = $${paramCount}`);
            queryParams.push(passwordHash);
            paramCount++;
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                status: 'error',
                message: 'No fields to update'
            });
        }

        // Add userId to params array
        queryParams.push(userId);

        // Construct and execute update query
        const query = `
            UPDATE users 
            SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $${paramCount}
            RETURNING id, email, first_name, last_name, role, created_at, updated_at
        `;

        const result = await db.query(query, queryParams);

        res.json({
            status: 'success',
            data: result.rows[0],
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({
            status: 'error',
            message: 'Error updating user'
        });
    }
};

module.exports = {
    getAllUsers,
    getUserById,
    updateUser
}; 