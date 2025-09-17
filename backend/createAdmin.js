const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Load environment variables
require('dotenv').config();

async function createAdminUser() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: 'your_email@gmail.com' }); // Change this to match your email
        if (existingAdmin) {
            console.log('Admin user already exists');
            console.log('Email: your_email@gmail.com'); // Change this to match your email
            console.log('Password: your_password');     // Change this to match your password
            console.log('Role:', existingAdmin.role);
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('your_password', 10); // Change 'your_password' to your desired password

        // Create admin user
        const adminUser = new User({
            username: 'your_admin_username', // Change this to your desired username
            email: 'your_email@gmail.com',   // Change this to your desired email
            password: hashedPassword,
            role: 'admin',
            profile: {
                firstName: 'Your',           // Change this to your first name
                lastName: 'Name',            // Change this to your last name
                bio: 'System Administrator'
            }
        });

        await adminUser.save();
        console.log('Admin user created successfully!');
        console.log('Email: your_email@gmail.com'); // Change this to match your email
        console.log('Password: your_password');     // Change this to match your password
        console.log('Role: admin');

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin user:', error);
        process.exit(1);
    }
}

createAdminUser();



