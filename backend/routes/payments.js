const express = require('express');
const Stripe = require('stripe');
const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Support common env names for Stripe keys
const stripeSecretKey = process.env.STRIPE_SECRET_KEY 
    || process.env.STRIPE_SECRET 
    || process.env.STRIPE_SK;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET 
    || process.env.STRIPE_WEBHOOK 
    || process.env.STRIPE_WHSEC;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// Expose publishable key (safe)
router.get('/public-key', (req, res) => {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY 
        || process.env.STRIPE_PUBLIC_KEY 
        || process.env.REACT_APP_STRIPE_PUBLIC_KEY;
    if (!publishableKey) {
        return res.status(404).json({ error: 'Publishable key not configured on server' });
    }
    return res.json({ publishableKey });
});

// Create Checkout from a booking id
router.post('/checkout-from-booking', authenticateToken, async (req, res) => {
    try {
        if (!stripe) return res.status(500).json({ error: 'Stripe is not configured on the server' });
        const { bookingId } = req.body;
        if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

        const booking = await Booking.findById(bookingId).populate('event');
        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized for this booking' });
        }
        if (!booking.event) return res.status(400).json({ error: 'Event not found for booking' });
        if (booking.status === 'cancelled') return res.status(400).json({ error: 'Booking is cancelled' });
        if (booking.paymentStatus === 'paid') return res.status(400).json({ error: 'Booking already paid' });
        if (booking.event.seatsLeft < booking.ticketQuantity) {
            return res.status(400).json({ error: 'Not enough tickets left for this event' });
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${booking.event.title} - ${new Date(booking.event.date).toLocaleString()}`,
                            metadata: { eventId: String(booking.event._id) }
                        },
                        unit_amount: Math.round(booking.event.ticketPrice * 100)
                    },
                    quantity: booking.ticketQuantity
                }
            ],
            customer_email: req.user.email,
            metadata: {
                userId: String(req.user._id),
                eventId: String(booking.event._id),
                bookingId: String(booking._id),
                ticketQuantity: String(booking.ticketQuantity)
            },
            success_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:3000'}/user/bookings?canceled=1`
        });

        booking.checkoutSessionId = session.id;
        await booking.save();

        return res.json({ id: session.id, url: session.url });
    } catch (error) {
        console.error('Error creating checkout from booking:', error);
        return res.status(500).json({ error: error?.message || 'Failed to create checkout session' });
    }
});

// Webhook to confirm payment and finalize booking
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    if (!stripe) return res.status(500).json({ error: 'Stripe is not configured on the server' });
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        if (stripeWebhookSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
        } else {
            event = req.body;
        }
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId;
        const ticketQuantity = parseInt(session.metadata?.ticketQuantity || '0', 10);
        if (!bookingId || !ticketQuantity) return res.json({ received: true });

        const tx = await mongoose.startSession();
        tx.startTransaction();
        try {
            const booking = await Booking.findById(bookingId).session(tx).populate('event');
            if (!booking || !booking.event) throw new Error('Booking or event not found');
            if (booking.paymentStatus === 'paid') {
                await tx.commitTransaction();
                tx.endSession();
                return res.json({ received: true });
            }
            if (booking.event.seatsLeft < ticketQuantity) throw new Error('Insufficient seats at confirm time');

            booking.paymentStatus = 'paid';
            booking.status = 'confirmed';
            await booking.save({ session: tx });

            booking.event.seatsLeft -= ticketQuantity;
            if (booking.event.seatsLeft <= 0) booking.event.status = 'sold out';
            await booking.event.save({ session: tx });

            await tx.commitTransaction();
        } catch (e) {
            await tx.abortTransaction();
            console.error('Webhook confirm error:', e);
        } finally {
            tx.endSession();
        }
    }

    res.json({ received: true });
});

module.exports = router;


