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

// Log Stripe configuration status for easier debugging
const stripeConfigured = !!(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET || process.env.STRIPE_SK);
console.log('Stripe configured:', stripeConfigured ? 'Yes' : 'No');

// Middleware
app.use(cors());

// Stripe webhook requires raw body; mount raw for that path before JSON parser
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), (req, res, next) => next());
// JSON parser for other routes
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
app.get("/", (req, res) => {
  res.send("Backend running successfully on Render!");
});

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
const chatbotRoutes = require('./routes/chatbot');
const paymentsRoutes = require('./routes/payments');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/payments', paymentsRoutes);
// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api/auth`);
    console.log('Note: Authentication features require MongoDB to be running');
});
