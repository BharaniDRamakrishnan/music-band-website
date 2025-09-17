const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

// Debug: Check if environment variables are loaded
console.log('Environment variables loaded:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'NOT LOADED');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'NOT LOADED');
console.log('PORT:', process.env.PORT || 'Using default (5000)');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.log('MongoDB Connection Error:', err.message);
        console.log('Please make sure MongoDB is running on your system');
        console.log('You can install MongoDB from: https://docs.mongodb.com/manual/installation/');
        console.log('Server will continue running but authentication features will not work');
    });
} else {
    console.log('MONGO_URI not found in environment variables');
    console.log('Please check your .env file');
    console.log('Server will continue running but authentication features will not work');
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Music Band Backend is running',
        timestamp: new Date().toISOString(),
        mongodb: process.env.MONGO_URI ? 'Configured' : 'Not configured'
    });
});

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const bookingRoutes = require('./routes/bookings');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/auth`);
    console.log('Note: Authentication features require MongoDB to be running');
});
