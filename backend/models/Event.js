const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        default: ''
    },
    ticketPrice: {
        type: Number,
        default: 0
    },
    maxAttendees: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        enum: ['Concert', 'Festival', 'Workshop', 'Meet & Greet', 'Other'],
        default: 'Other'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        default: 'upcoming'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Event', EventSchema);


