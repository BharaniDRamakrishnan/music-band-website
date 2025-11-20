const express = require('express');
const Event = require('../models/Event');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all events (public)
router.get('/', async (req, res) => {
    try {
        const events = await Event.find({ 
            status: { $in: ['upcoming', 'sold out'] } 
        })
            .populate('createdBy', 'username')
            .sort({ date: 1 });
        
        console.log(`Found ${events.length} events`);
        console.log('Events statuses:', events.map(e => ({ title: e.title, status: e.status, capacity: e.capacity, seatsLeft: e.seatsLeft })));
        
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
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
        
        console.log('Creating event with data:', { title, description, date, location, maxAttendees, category });

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
            capacity: maxAttendees > 0 ? maxAttendees : 100, // Use maxAttendees as capacity, default to 100 if not provided
            category: category || 'Other',
            createdBy: req.user._id
        });

        const savedEvent = await newEvent.save();
        console.log('Event created with status:', savedEvent.status);
        console.log('Event capacity:', savedEvent.capacity);
        console.log('Event seatsLeft:', savedEvent.seatsLeft);
        
        const populatedEvent = await Event.findById(savedEvent._id)
            .populate('createdBy', 'username');

        console.log('Populated event status:', populatedEvent.status);
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

// Admin: Get event ticket availability
router.get('/admin/:id/availability', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        const availability = {
            eventId: event._id,
            title: event.title,
            capacity: event.capacity,
            bookedTickets: event.capacity - event.seatsLeft,
            remainingTickets: event.seatsLeft,
            status: event.seatsLeft <= 0 ? 'Sold Out' : 
                   event.seatsLeft < event.capacity * 0.1 ? 'Limited Availability' : 'Available',
            percentageSold: Math.round((event.capacity - event.seatsLeft) / event.capacity * 100),
            eventStatus: event.status,
            ticketPrice: event.ticketPrice,
            location: event.location,
            date: event.date
        };

        res.json(availability);
    } catch (error) {
        console.error('Error fetching event availability:', error);
        res.status(500).json({ error: 'Error fetching event availability' });
    }
});

// Admin: Get all events availability overview
router.get('/admin/availability/overview', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const events = await Event.find({})
            .populate('createdBy', 'username')
            .sort({ date: 1 });

        const overview = events.map(event => ({
            eventId: event._id,
            title: event.title,
            capacity: event.capacity,
            bookedTickets: event.capacity - event.seatsLeft,
            remainingTickets: event.seatsLeft,
            percentageSold: event.capacity > 0 ? Math.round((event.capacity - event.seatsLeft) / event.capacity * 100) : 0,
            status: event.seatsLeft <= 0 ? 'Sold Out' : 'Available',
            revenue: (event.capacity - event.seatsLeft) * event.ticketPrice
        }));

        const totalStats = {
            totalEvents: events.length,
            totalCapacity: events.reduce((sum, event) => sum + event.capacity, 0),
            totalBooked: events.reduce((sum, event) => sum + (event.capacity - event.seatsLeft), 0),
            totalRevenue: events.reduce((sum, event) => sum + ((event.capacity - event.seatsLeft) * event.ticketPrice), 0),
            averageOccupancyRate: events.length > 0 ? 
                events.reduce((sum, event) => sum + ((event.capacity - event.seatsLeft) / event.capacity * 100), 0) / events.length : 0
        };

        res.json({
            events: overview,
            totalStats
        });
    } catch (error) {
        console.error('Error fetching availability overview:', error);
        res.status(500).json({ error: 'Error fetching availability overview' });
    }
});

module.exports = router;

