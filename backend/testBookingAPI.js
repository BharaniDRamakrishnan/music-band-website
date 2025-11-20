const axios = require('axios');

async function testBookingAPI() {
    try {
        // First, let's get the current events
        console.log('Getting current events...');
        const eventsResponse = await axios.get('http://localhost:5000/api/events');
        const events = eventsResponse.data;
        
        console.log('Current events:');
        events.forEach(event => {
            console.log(`- ${event.title}: ${event.seatsLeft}/${event.capacity} seats (${event.status})`);
        });
        
        // Find an event with available seats
        const availableEvent = events.find(event => event.seatsLeft > 0);
        if (!availableEvent) {
            console.log('No events with available seats found');
            return;
        }
        
        console.log(`\nTesting booking for: ${availableEvent.title}`);
        console.log(`Available seats before: ${availableEvent.seatsLeft}`);
        
        // You would need to login first to get a token
        console.log('\nTo test booking, you need to:');
        console.log('1. Start your frontend server: cd frontend && npm start');
        console.log('2. Open http://localhost:3000');
        console.log('3. Login as a user');
        console.log('4. Try booking tickets for an event');
        console.log('5. Check if the seat count decreases');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testBookingAPI();
