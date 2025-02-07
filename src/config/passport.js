const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const db = require('./database');

passport.use(
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                // Find user by email
                const result = await db.query(
                    'SELECT * FROM users WHERE email = $1',
                    [email.toLowerCase()]
                );

                const user = result.rows[0];

                // If user not found
                if (!user) {
                    return done(null, false, { message: 'Invalid email or password' });
                }

                // Check password
                const isMatch = await bcrypt.compare(password, user.password_hash);
                if (!isMatch) {
                    return done(null, false, { message: 'Invalid email or password' });
                }

                // Remove password_hash from user object
                delete user.password_hash;
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const result = await db.query(
            'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
            [id]
        );
        const user = result.rows[0];
        done(null, user);
    } catch (error) {
        done(error);
    }
});

module.exports = passport; 