const express = require('express');
const cors = require('cors');
const { initializeDb } = require('./db/database');
const adminRoutes = require('./src/routes/admin');
const llmRoutes = require('./src/routes/llm');
const mediaRoutes = require('./src/routes/media');

const app = express();
const port = process.env.PORT || 8080;

// Configure CORS to allow requests from frontend
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json());
app.use(express.static('public'));

// Add admin routes
app.use('/api/admin', adminRoutes);
app.use('/api', llmRoutes);
app.use('/api', mediaRoutes);

// Initialize database and start server
async function startServer() {
    try {
        await initializeDb();
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();