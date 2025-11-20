const mongoose = require('mongoose');
const Event = require('./models/Event');

// Load environment variables
require('dotenv').config();

async function checkEventStatus() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Get all events
        const events = await Event.find({}).populate('createdBy', 'username');
        
        if (events.length === 0) {
            console.log('No events found in database');
            return;
        }

        console.log(`Found ${events.length} events:`);
        console.log('=====================================');
        
        events.forEach((event, index) => {
            console.log(`${index + 1}. Event: ${event.title}`);
            console.log(`   ID: ${event._id}`);
            console.log(`   Status: ${event.status}`);
            console.log(`   Date: ${event.date}`);
            console.log(`   Created by: ${event.createdBy?.username || 'Unknown'}`);
            console.log(`   Can Book: ${(event.status === 'upcoming' || event.status === 'ongoing') ? 'Yes' : 'No'}`);
            console.log('-------------------------------------');
        });

        // Check specific statuses
        const upcomingEvents = await Event.countDocuments({ status: 'upcoming' });
        const ongoingEvents = await Event.countDocuments({ status: 'ongoing' });
        const completedEvents = await Event.countDocuments({ status: 'completed' });
        const cancelledEvents = await Event.countDocuments({ status: 'cancelled' });

        console.log('\nEvent Status Summary:');
        console.log('=====================================');
        console.log(`Upcoming: ${upcomingEvents}`);
        console.log(`Ongoing: ${ongoingEvents}`);
        console.log(`Completed: ${completedEvents}`);
        console.log(`Cancelled: ${cancelledEvents}`);
        console.log(`Total: ${events.length}`);

        process.exit(0);
    } catch (error) {
        console.error('Error checking event status:', error);
        process.exit(1);
    }
}

checkEventStatus();























