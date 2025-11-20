const mongoose = require('mongoose');
const Event = require('./models/Event');
const Booking = require('./models/Booking');
const User = require('./models/User');

// Load environment variables
require('dotenv').config();

async function testBooking() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Get an event to test with
        const event = await Event.findOne({ status: 'upcoming' });
        if (!event) {
            console.log('No upcoming events found');
            return;
        }

        console.log(`Testing with event: ${event.title}`);
        console.log(`Initial seatsLeft: ${event.seatsLeft}`);

        // Get a user to test with
        const user = await User.findOne({ role: 'user' });
        if (!user) {
            console.log('No user found. Please create a user account first.');
            return;
        }

        console.log(`Testing with user: ${user.username}`);

        // Test booking process (without transactions)
        const ticketQuantity = 2;
        
        if (event.seatsLeft < ticketQuantity) {
            console.log('Not enough tickets available');
            return;
        }

        // Create booking
        const newBooking = new Booking({
            user: user._id,
            event: event._id,
            ticketQuantity,
            totalPrice: event.ticketPrice * ticketQuantity,
            specialRequests: 'Test booking',
            contactInfo: {
                phone: '1234567890',
                email: user.email
            }
        });

        await newBooking.save();

        // Update event seatsLeft
        event.seatsLeft -= ticketQuantity;
        if (event.seatsLeft <= 0) {
            event.status = 'sold out';
        }
        await event.save();

        console.log('✅ Booking created successfully!');
        console.log(`Remaining seats: ${event.seatsLeft}`);
        console.log(`Event status: ${event.status}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testBooking();
