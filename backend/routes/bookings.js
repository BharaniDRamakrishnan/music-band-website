const express = require('express');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { authenticateToken, requireAdmin, requireAdminOrOwner } = require('../middleware/auth');

const router = express.Router();

// Get all bookings for admin
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'username email profile.firstName profile.lastName')
            .populate('event', 'title date location ticketPrice')
            .sort({ bookingDate: -1 });
        
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        res.status(500).json({ error: 'Error fetching bookings' });
    }
});

// Get user's own bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('event', 'title date location ticketPrice image')
            .sort({ bookingDate: -1 });
        
        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ error: 'Error fetching your bookings' });
    }
});

// Book tickets for an event
router.post('/book', authenticateToken, async (req, res) => {
    try {
        const { eventId, ticketQuantity, specialRequests, contactInfo } = req.body;
        
        // Validate event exists and has available tickets
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        
        if (event.status !== 'upcoming' && event.status !== 'ongoing') {
            return res.status(400).json({ error: 'Event is not available for booking' });
        }
        
        // Check if user already booked this event
        const existingBooking = await Booking.findOne({ user: req.user._id, event: eventId });
        if (existingBooking) {
            return res.status(400).json({ error: 'You have already booked this event' });
        }
        
        // Calculate total price
        const totalPrice = event.ticketPrice * ticketQuantity;
        
        // Create booking
        const newBooking = new Booking({
            user: req.user._id,
            event: eventId,
            ticketQuantity,
            totalPrice,
            specialRequests,
            contactInfo: {
                phone: contactInfo?.phone || req.user.profile?.phone,
                email: req.user.email
            }
        });
        
        await newBooking.save();
        
        // Update user stats
        req.user.stats.eventsAttended += ticketQuantity;
        await req.user.save();
        
        // Populate event details for response
        await newBooking.populate('event', 'title date location');
        
        res.status(201).json({
            message: 'Tickets booked successfully!',
            booking: newBooking
        });
        
    } catch (error) {
        console.error('Error booking tickets:', error);
        res.status(500).json({ error: 'Error booking tickets' });
    }
});

// Cancel a booking (user can only cancel their own)
router.put('/cancel/:id', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'You can only cancel your own bookings' });
        }
        
        if (booking.status === 'cancelled') {
            return res.status(400).json({ error: 'Booking is already cancelled' });
        }
        
        booking.status = 'cancelled';
        await booking.save();
        
        res.json({ message: 'Booking cancelled successfully', booking });
        
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ error: 'Error cancelling booking' });
    }
});

// Admin: Update booking status
router.put('/admin/:id/status', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        if (status) booking.status = status;
        if (paymentStatus) booking.paymentStatus = paymentStatus;
        
        await booking.save();
        
        res.json({ message: 'Booking updated successfully', booking });
        
    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({ error: 'Error updating booking' });
    }
});

// Admin: Delete booking
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndDelete(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }
        
        res.json({ message: 'Booking deleted successfully' });
        
    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ error: 'Error deleting booking' });
    }
});

// User: Delete own booking (or admin can delete any)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const isOwner = booking.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'You can only delete your own bookings' });
        }

        if (!isAdmin && booking.status === 'confirmed') {
            return res.status(400).json({ error: 'Please cancel the booking before deleting' });
        }

        await Booking.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting own booking:', error);
        return res.status(500).json({ error: 'Error deleting booking' });
    }
});

// Fallback: Some environments block DELETE; support PUT /delete/:id
router.put('/delete/:id', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const isOwner = booking.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'You can only delete your own bookings' });
        }

        if (!isAdmin && booking.status === 'confirmed') {
            return res.status(400).json({ error: 'Please cancel the booking before deleting' });
        }

        await Booking.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting own booking (PUT fallback):', error);
        return res.status(500).json({ error: 'Error deleting booking' });
    }
});

// Fallback 2: POST /:id/delete for environments limiting DELETE/PUT
router.post('/:id/delete', authenticateToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        const isOwner = booking.user.toString() === req.user._id.toString();
        const isAdmin = req.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'You can only delete your own bookings' });
        }

        if (!isAdmin && booking.status === 'confirmed') {
            return res.status(400).json({ error: 'Please cancel the booking before deleting' });
        }

        await Booking.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Error deleting own booking (POST fallback):', error);
        return res.status(500).json({ error: 'Error deleting booking' });
    }
});

// Get booking statistics for admin
router.get('/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
        const pendingBookings = await Booking.countDocuments({ status: 'pending' });
        const totalRevenue = await Booking.aggregate([
            { $match: { status: 'confirmed', paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        
        const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
        
        res.json({
            totalBookings,
            confirmedBookings,
            pendingBookings,
            totalRevenue: revenue,
            conversionRate: totalBookings > 0 ? (confirmedBookings / totalBookings * 100).toFixed(2) : 0
        });
        
    } catch (error) {
        console.error('Error fetching booking stats:', error);
        res.status(500).json({ error: 'Error fetching booking statistics' });
    }
});

module.exports = router;



