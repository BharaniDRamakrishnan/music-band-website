const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    ticketQuantity: {
        type: Number,
        required: true,
        min: 1,
        max: 10 // Limit tickets per booking
    },
    totalPrice: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled'],
        default: 'pending'
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'refunded'],
        default: 'pending'
    },
    specialRequests: {
        type: String,
        maxlength: 500
    },
    contactInfo: {
        phone: String,
        email: String
    },
    checkoutSessionId: {
        type: String,
        index: true
    }
}, {
    timestamps: true
});

// Ensure user can't book the same event multiple times
BookingSchema.index({ user: 1, event: 1 }, { unique: true });

// Virtual for formatted booking date
BookingSchema.virtual('formattedBookingDate').get(function() {
    return this.bookingDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
});

// Ensure virtual fields are serialized
BookingSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Booking', BookingSchema);




















