const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { connectMongo, initSQLite } = require('./config/db');

const app = express();

// Middlewares
app.use(helmet()); // Security headers
app.use(cors());   // Enable CORS
app.use(express.json()); // Body parser

// Initialize Databases then start server
const startServer = async () => {
    // Connect MongoDB (for assignments & attempts)
    await connectMongo();

    // Initialize SQLite In-Memory DB (for SQL sandbox - replaces PostgreSQL)
    await initSQLite();

    // Routes
    app.use('/api', require('./routes/queryRoutes'));

    // Basic Route
    app.get('/', (req, res) => {
        res.json({ message: 'Welcome to CipherSQLStudio API' });
    });

    // Port
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};

startServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
