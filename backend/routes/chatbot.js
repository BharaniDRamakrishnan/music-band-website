const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const Event = require('../models/Event');
const Booking = require('../models/Booking');

const router = express.Router();

// Chatbot endpoint
router.post('/', async (req, res) => {
    try {
        console.log('Chatbot request received:', req.body);
        const { message, token } = req.body;
        
        if (!message) {
            console.log('No message provided');
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log('Processing message:', message);
        const userMessage = message.toLowerCase();
        let response = '';
        let data = null;
        let needsAuth = false;

        // Rule-based responses
        if (userMessage.includes('events') || userMessage.includes('event')) {
            try {
                const events = await Event.find({ status: { $in: ['upcoming', 'sold out'] } })
                    .populate('createdBy', 'username')
                    .sort({ date: 1 })
                    .limit(5);
                
                if (events.length === 0) {
                    response = 'There are no upcoming events at the moment. Check back later for new announcements!';
                } else {
                    response = 'Here are the upcoming events:';
                    data = events.map(event => ({
                        id: event._id,
                        title: event.title,
                        date: event.date,
                        location: event.location,
                        ticketPrice: event.ticketPrice,
                        description: event.description,
                        capacity: event.capacity,
                        seatsLeft: event.seatsLeft
                    }));
                }
            } catch (error) {
                response = 'I encountered an error while fetching events. Please try again later.';
            }
        } 
        else if (userMessage.includes('bookings') || userMessage.includes('booking') || userMessage.includes('my booking')) {
            needsAuth = true;
            if (!token) {
                response = 'To view your bookings, please log in to your account first.';
            } else {
                try {
                    // Use the token to authenticate the user
                    const jwt = require('jsonwebtoken');
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    
                    const bookings = await Booking.find({ user: decoded._id })
                        .populate('event', 'title date location ticketPrice image')
                        .sort({ bookingDate: -1 });
                    
                    if (bookings.length === 0) {
                        response = 'You don\'t have any bookings yet. Would you like to browse events and book some tickets?';
                    } else {
                        response = 'Here are your bookings:';
                        data = bookings.map(booking => ({
                            id: booking._id,
                            eventTitle: booking.event.title,
                            eventDate: booking.event.date,
                            eventLocation: booking.event.location,
                            ticketQuantity: booking.ticketQuantity,
                            totalPrice: booking.totalPrice,
                            status: booking.status,
                            bookingDate: booking.bookingDate
                        }));
                    }
                } catch (error) {
                    response = 'There was an error accessing your bookings. Please make sure you\'re logged in.';
                }
            }
        }
        else if (userMessage.includes('book tickets') || userMessage.includes('book ticket') || userMessage.includes('purchase')) {
            needsAuth = true;
            if (!token) {
                response = 'To book tickets, please log in to your account first. You can then visit the Events page to select and book tickets for upcoming events.';
            } else {
                response = 'Great! You can book tickets by visiting the Events page and clicking on an event you\'re interested in. Each event will have a booking form where you can select the number of tickets and complete your purchase.';
            }
        }
        else if (userMessage.includes('help') || userMessage.includes('what can you do')) {
            response = 'I can help you with:\n• View upcoming events\n• Check your bookings\n• Guide you through booking tickets\n• Answer questions about our platform\n\nJust ask me anything about events or bookings!';
        }
        else {
            response = 'I\'m here to help you with events and bookings! You can ask me about upcoming events, your bookings, or how to book tickets. Just let me know what you need!';
        }

        res.json({
            response,
            data,
            needsAuth: needsAuth && !token
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        res.status(500).json({ 
            response: 'I encountered an error while processing your request. Please try again.',
            error: 'Internal server error'
        });
    }
});

// Health check for chatbot
router.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Chatbot is running',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;