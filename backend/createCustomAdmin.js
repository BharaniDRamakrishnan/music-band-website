const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Load environment variables
require('dotenv').config();

// Custom admin credentials - CHANGE THESE VALUES
const ADMIN_CREDENTIALS = {
    username: 'admin',    // Change this
    email: 'admin@musicband.com',      // Change this
    password: 'admin123',          // Change this
    firstName: 'Admin',                  // Change this
    lastName: 'User'                    // Change this
};

async function createCustomAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: ADMIN_CREDENTIALS.email });
        if (existingAdmin) {
            console.log('Admin user already exists with this email');
            console.log('Username:', existingAdmin.username);
            console.log('Email:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);
            process.exit(0);
        }

        // Check if username is taken
        const existingUsername = await User.findOne({ username: ADMIN_CREDENTIALS.username });
        if (existingUsername) {
            console.log('Username already taken. Please choose a different username.');
            process.exit(1);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(ADMIN_CREDENTIALS.password, 10);

        // Create admin user
        const adminUser = new User({
            username: ADMIN_CREDENTIALS.username,
            email: ADMIN_CREDENTIALS.email,
            password: hashedPassword,
            role: 'admin',
            profile: {
                firstName: ADMIN_CREDENTIALS.firstName,
                lastName: ADMIN_CREDENTIALS.lastName,
                bio: 'System Administrator'
            }
        });

        await adminUser.save();
        console.log('✅ Custom Admin user created successfully!');
        console.log('👤 Username:', ADMIN_CREDENTIALS.username);
        console.log('📧 Email:', ADMIN_CREDENTIALS.email);
        console.log('🔑 Password:', ADMIN_CREDENTIALS.password);
        console.log('🔐 Role: admin');
        console.log('📝 Name:', `${ADMIN_CREDENTIALS.firstName} ${ADMIN_CREDENTIALS.lastName}`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }
}

createCustomAdmin();



