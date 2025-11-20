const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Load environment variables
require('dotenv').config();

// Admin credentials to update - CHANGE THESE VALUES
const ADMIN_UPDATE = {
    email: 'bharanir.23it@kongu.edu',  // Email of existing admin user
    newPassword: 'new_password_here',   // New password to set
    newUsername: 'new_username_here'    // New username (optional)
};

async function changeAdminPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');

        // Find the existing admin user
        const existingAdmin = await User.findOne({ email: ADMIN_UPDATE.email });
        if (!existingAdmin) {
            console.log('❌ Admin user not found with this email');
            process.exit(1);
        }

        if (existingAdmin.role !== 'admin') {
            console.log('❌ User found but is not an admin');
            process.exit(1);
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(ADMIN_UPDATE.newPassword, 10);

        // Update the admin user
        const updateData = {
            password: hashedPassword
        };

        // Add username update if provided
        if (ADMIN_UPDATE.newUsername && ADMIN_UPDATE.newUsername !== existingAdmin.username) {
            // Check if new username is available
            const usernameExists = await User.findOne({ username: ADMIN_UPDATE.newUsername });
            if (usernameExists) {
                console.log('❌ Username already taken. Please choose a different username.');
                process.exit(1);
            }
            updateData.username = ADMIN_UPDATE.newUsername;
        }

        const updatedAdmin = await User.findByIdAndUpdate(
            existingAdmin._id,
            updateData,
            { new: true, runValidators: true }
        );

        console.log('✅ Admin user updated successfully!');
        console.log('👤 Username:', updatedAdmin.username);
        console.log('📧 Email:', updatedAdmin.email);
        console.log('🔑 New Password:', ADMIN_UPDATE.newPassword);
        console.log('🔐 Role:', updatedAdmin.role);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating admin user:', error);
        process.exit(1);
    }
}

changeAdminPassword();






















