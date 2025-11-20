const mongoose = require('mongoose');
const Event = require('./models/Event');

// Load environment variables
require('dotenv').config();

async function updateEventsCapacity() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Find all events that don't have capacity set
        const events = await Event.find({
            $or: [
                { capacity: { $exists: false } },
                { capacity: 0 },
                { seatsLeft: { $exists: false } }
            ]
        });

        console.log(`Found ${events.length} events to update`);

        for (const event of events) {
            // Set default capacity based on event type or use a reasonable default
            let capacity = 100; // Default capacity
            
            // You can customize capacity based on event category or other factors
            if (event.category === 'Concert') {
                capacity = 200;
            } else if (event.category === 'Festival') {
                capacity = 500;
            } else if (event.category === 'Workshop') {
                capacity = 50;
            } else if (event.category === 'Meet & Greet') {
                capacity = 30;
            }

            // Update the event with capacity and seatsLeft
            await Event.findByIdAndUpdate(event._id, {
                capacity: capacity,
                seatsLeft: capacity,
                status: 'upcoming' // Reset status to upcoming if it was sold out
            });

            console.log(`Updated event "${event.title}" with capacity: ${capacity}`);
        }

        console.log('✅ All events updated successfully!');
        console.log('Events now have proper capacity and seatsLeft values.');
        console.log('Users can now book tickets for these events.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating events:', error);
        process.exit(1);
    }
}

updateEventsCapacity();
