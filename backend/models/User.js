const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true,
        lowercase: true
    },
    password: { 
        type: String, 
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    profile: {
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        bio: { type: String, maxlength: 500 },
        avatar: { type: String },
        location: { type: String, trim: true },
        website: { type: String, trim: true },
        socialMedia: {
            twitter: { type: String, trim: true },
            instagram: { type: String, trim: true },
            facebook: { type: String, trim: true }
        }
    },
    preferences: {
        emailNotifications: { type: Boolean, default: true },
        eventUpdates: { type: Boolean, default: true },
        newsletter: { type: Boolean, default: false }
    },
    stats: {
        eventsCreated: { type: Number, default: 0 },
        eventsAttended: { type: Number, default: 0 },
        lastLogin: { type: Date, default: Date.now }
    }
}, {
    timestamps: true
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
    if (this.profile.firstName && this.profile.lastName) {
        return `${this.profile.firstName} ${this.profile.lastName}`;
    }
    return this.username;
});

// Ensure virtual fields are serialized
UserSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('User', UserSchema);
