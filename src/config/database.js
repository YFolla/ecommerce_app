const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait when connecting a new client
});

// The pool will emit an error on behalf of any idle clients
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

// Test database connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL database');
        client.release();
        return true;
    } catch (err) {
        console.error('Error connecting to the database:', err.message);
        return false;
    }
};

// Test the connection when the module is loaded
testConnection();

module.exports = {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
    pool,
    testConnection
};
