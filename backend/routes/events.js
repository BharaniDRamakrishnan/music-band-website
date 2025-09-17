const express = require('express');
const Event = require('../models/Event');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all events (public)
router.get('/', async (req, res) => {
    try {
        const events = await Event.find({ status: 'upcoming' })
            .populate('createdBy', 'username')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching events' });
    }
});

// Get single event (public)
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('createdBy', 'username');
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching event' });
    }
});

// Create new event (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { title, description, date, location, image, ticketPrice, maxAttendees, category } = req.body;

        if (!title || !description || !date || !location) {
            return res.status(400).json({ error: 'Title, description, date, and location are required' });
        }

        const newEvent = new Event({
            title,
            description,
            date: new Date(date),
            location,
            image: image || '',
            ticketPrice: ticketPrice || 0,
            maxAttendees: maxAttendees || 0,
            category: category || 'Other',
            createdBy: req.user._id
        });

        const savedEvent = await newEvent.save();
        console.log('Event created with status:', savedEvent.status);
        
        const populatedEvent = await Event.findById(savedEvent._id)
            .populate('createdBy', 'username');

        res.status(201).json(populatedEvent);
    } catch (error) {
        res.status(500).json({ error: 'Error creating event' });
    }
});

// Update event (admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('createdBy', 'username');

        console.log('Event updated, new status:', updatedEvent.status);
        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ error: 'Error updating event' });
    }
});

// Delete event (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting event' });
    }
});

// Admin: Get all events (including private ones)
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const events = await Event.find({})
            .populate('createdBy', 'username profile.firstName profile.lastName')
            .sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching all events' });
    }
});

// Admin: Get event statistics
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalEvents = await Event.countDocuments();
        const upcomingEvents = await Event.countDocuments({ status: 'upcoming' });
        const completedEvents = await Event.countDocuments({ status: 'completed' });
        const cancelledEvents = await Event.countDocuments({ status: 'cancelled' });
        
        const eventsByCategory = await Event.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            totalEvents,
            upcomingEvents,
            completedEvents,
            cancelledEvents,
            eventsByCategory
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching event statistics' });
    }
});

module.exports = router;

