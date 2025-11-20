import React, { useState } from 'react';
import axios from 'axios';
import './BookTicket.css';

function BookTicket({ event, onClose, onBookingSuccess }) {
    const [formData, setFormData] = useState({
        ticketQuantity: 1,
        specialRequests: '',
        contactInfo: {
            phone: '',
            email: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.startsWith('contactInfo.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                contactInfo: {
                    ...prev.contactInfo,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage({ text: 'Please login to book tickets', type: 'error' });
                setLoading(false);
                return;
            }

            // Directly create booking (no payment)
            const response = await axios.post('http://localhost:5000/api/bookings/book', {
                eventId: event._id,
                ticketQuantity: parseInt(formData.ticketQuantity),
                specialRequests: formData.specialRequests,
                contactInfo: formData.contactInfo
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ text: response.data.message, type: 'success' });
            setTimeout(() => {
                onClose();
                if (onBookingSuccess) onBookingSuccess();
            }, 1200);

        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error booking tickets. Please try again.';
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Ensure event has required properties
    if (!event || !event._id || !event.title) {
        return (
            <div className="book-ticket-overlay">
                <div className="book-ticket-modal">
                    <div className="book-ticket-header">
                        <h2>Book Tickets</h2>
                        <button className="close-btn" onClick={onClose}>&times;</button>
                    </div>
                    <div className="event-unavailable">
                        <p>⚠️ Invalid event data</p>
                        <p>Please try again or contact support.</p>
                    </div>
                </div>
            </div>
        );
    }

    const totalPrice = event.ticketPrice * formData.ticketQuantity;

    return (
        <div className="book-ticket-overlay">
            <div className="book-ticket-modal">
                <div className="book-ticket-header">
                    <h2>Book Tickets</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>

                <div className="event-summary">
                    <h3>{event.title}</h3>
                    <p className="event-date">{new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}</p>
                    <p className="event-location">📍 {event.location}</p>
                    <p className="event-price">💰 ${event.ticketPrice} per ticket</p>
                    
                    {/* Show ticket availability */}
                    {event.capacity && (
                        <div className="ticket-availability-info">
                            <div className="availability-badge">
                                {event.seatsLeft <= 0 ? (
                                    <span className="sold-out-indicator">🔴 SOLD OUT</span>
                                ) : (
                                    <span className="available-indicator">✅ {event.seatsLeft} tickets available</span>
                                )}
                            </div>
                            <p className="capacity-text">Total capacity: {event.capacity} tickets</p>
                        </div>
                    )}
                </div>

                {/* Check if event is available for booking */}
                {(event.status !== 'upcoming' && event.status !== 'ongoing' && event.status !== 'sold out') && (
                    <div className="event-unavailable">
                        <p>⚠️ This event is not available for booking</p>
                        <p>Status: {event.status}</p>
                    </div>
                )}

                {/* Check if sold out */}
                {event.seatsLeft <= 0 && (
                    <div className="event-unavailable">
                        <p>🔴 This event is completely sold out</p>
                        <p>Sorry, no tickets are available for this event.</p>
                    </div>
                )}
                


                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="booking-form">
                    <div className="form-group">
                        <label htmlFor="ticketQuantity">Number of Tickets:</label>
                        <select
                            id="ticketQuantity"
                            name="ticketQuantity"
                            value={formData.ticketQuantity}
                            onChange={handleInputChange}
                            required
                            disabled={event.seatsLeft <= 0}
                        >
                            {Array.from({ length: Math.min(10, event.seatsLeft || 10) }, (_, i) => i + 1).map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                        {event.seatsLeft && event.seatsLeft > 0 && (
                            <p className="ticket-limit-note">
                                Maximum {event.seatsLeft} tickets available
                            </p>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number (Optional):</label>
                        <input
                            type="tel"
                            id="phone"
                            name="contactInfo.phone"
                            placeholder="Your phone number"
                            value={formData.contactInfo.phone}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="specialRequests">Special Requests (Optional):</label>
                        <textarea
                            id="specialRequests"
                            name="specialRequests"
                            placeholder="Any special requirements or requests..."
                            value={formData.specialRequests}
                            onChange={handleInputChange}
                            rows="3"
                            maxLength="500"
                        />
                    </div>

                    <div className="price-summary">
                        <div className="price-row">
                            <span>Price per ticket:</span>
                            <span>${event.ticketPrice}</span>
                        </div>
                        <div className="price-row">
                            <span>Quantity:</span>
                            <span>{formData.ticketQuantity}</span>
                        </div>
                        <div className="price-row total">
                            <span>Total:</span>
                            <span>${totalPrice}</span>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="book-ticket-btn" 
                        disabled={loading || (event.status !== 'upcoming' && event.status !== 'ongoing')}
                    >
                        {loading ? 'Processing...' : 
                         (event.status !== 'upcoming' && event.status !== 'ongoing') ? 'Event Not Available' :
                         `Book ${formData.ticketQuantity} Ticket${formData.ticketQuantity > 1 ? 's' : ''}`}
                    </button>
                </form>

                <div className="booking-info">
                    <p>📝 You can cancel your booking anytime before the event</p>
                </div>
            </div>
        </div>
    );
}

export default BookTicket;



