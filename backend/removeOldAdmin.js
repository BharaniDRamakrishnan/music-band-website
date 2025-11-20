const mongoose = require('mongoose');
const User = require('./models/User');

// Load environment variables
require('dotenv').config();

async function removeOldAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Remove old admin user
        const oldAdmin = await User.findOneAndDelete({ 
            email: 'bharanir.23it@kongu.edu' 
        });

        if (oldAdmin) {
            console.log('✅ Old admin user removed successfully!');
            console.log('👤 Username:', oldAdmin.username);
            console.log('📧 Email:', oldAdmin.email);
        } else {
            console.log('ℹ️ No old admin user found to remove');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error removing old admin user:', error);
        process.exit(1);
    }
}

removeOldAdmin();




















