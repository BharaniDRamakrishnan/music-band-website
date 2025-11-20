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
    capacity: {
        type: Number,
        default: 0,
        required: true
    },
    seatsLeft: {
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
        enum: ['upcoming', 'ongoing', 'completed', 'cancelled', 'sold out'],
        default: 'upcoming'
    }
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Virtual: expose ticketsCount for clients expecting this field
EventSchema.virtual('ticketsCount').get(function() {
	return this.seatsLeft;
});

// Pre-save middleware to initialize seatsLeft and update status
EventSchema.pre('save', function(next) {
    // Always ensure seatsLeft is set to capacity for new events
    if (this.isNew) {
        this.seatsLeft = this.capacity;
    }
    
    // Update status based on seat availability
    if (this.seatsLeft <= 0) {
        this.status = 'sold out';
    } else if (this.status === 'sold out' && this.seatsLeft > 0) {
        this.status = 'upcoming';
    }
    
    next();
});

// Method to check if event is available for booking
EventSchema.methods.isAvailableForBooking = function(requestedTickets) {
    return this.status === 'upcoming' && this.seatsLeft >= (requestedTickets || 1);
};

// Method to reduce available seats
EventSchema.methods.reduceSeats = async function(ticketsCount) {
    if (this.seatsLeft >= ticketsCount) {
        this.seatsLeft -= ticketsCount;
        await this.save();
        return true;
    }
    return false;
};

// Method to add seats back (for cancellations)
EventSchema.methods.addSeats = async function(ticketsCount) {
    this.seatsLeft = Math.min(this.seatsLeft + ticketsCount, this.capacity);
    if (this.status === 'sold out') {
        this.status = 'upcoming';
    }
    await this.save();
    return true;
};

module.exports = mongoose.model('Event', EventSchema);


