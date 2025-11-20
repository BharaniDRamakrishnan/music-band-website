import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MyBookings.css';

function MyBookings({ onClose }) {
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [payingId, setPayingId] = useState(null);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage({ text: 'Please login to view your bookings', type: 'error' });
                setLoading(false);
                return;
            }

            const response = await axios.get('http://localhost:5000/api/bookings/my-bookings', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setBookings(response.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setMessage({ 
                text: error.response?.data?.error || 'Error fetching your bookings', 
                type: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:5000/api/bookings/cancel/${bookingId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage({ text: 'Booking cancelled successfully!', type: 'success' });
            
            // Refresh bookings
            fetchBookings();
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (error) {
            setMessage({ 
                text: error.response?.data?.error || 'Error cancelling booking', 
                type: 'error' 
            });
        }
    };

    const handleProceedToPayment = async (bookingId) => {
        try {
            setPayingId(bookingId);
            const token = localStorage.getItem('token');
            if (!token) {
                setMessage({ text: 'Please login to proceed to payment', type: 'error' });
                setPayingId(null);
                return;
            }

            const resp = await axios.post('http://localhost:5000/api/payments/checkout-from-booking', {
                bookingId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const url = resp.data?.url;
            const id = resp.data?.id;
            if (url) {
                window.location.href = url;
                return;
            }
            // Fallback: if only id is returned and you want to use Stripe.js in future
            if (id) {
                setMessage({ text: 'Checkout session created. Redirecting...', type: 'success' });
            } else {
                setMessage({ text: 'Failed to start payment session', type: 'error' });
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || 'Error starting payment session';
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setPayingId(null);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return '#28a745';
            case 'pending': return '#ffc107';
            case 'cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'confirmed': return '✅';
            case 'pending': return '⏳';
            case 'cancelled': return '❌';
            default: return '❓';
        }
    };

    const handleClose = () => {
        if (typeof onClose === 'function') {
            onClose();
        } else {
            if (window.history.length > 1) {
                navigate(-1);
            } else {
                navigate('/events');
            }
        }
    };

    if (loading) {
        return (
            <div className="my-bookings-overlay">
                <div className="my-bookings-modal">
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <p>Loading your bookings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-bookings-overlay">
            <div className="my-bookings-modal">
                <div className="my-bookings-header">
                    <h2>My Bookings</h2>
                    <button className="close-btn" onClick={handleClose}>&times;</button>
                </div>

                {message.text && (
                    <div className={`message ${message.type}`}>
                        {message.text}
                    </div>
                )}

                {bookings.length === 0 ? (
                    <div className="no-bookings">
                        <div className="no-bookings-icon">🎫</div>
                        <h3>No Bookings Yet</h3>
                        <p>You haven't booked any events yet. Start exploring events to make your first booking!</p>
                        <button className="explore-events-btn" onClick={handleClose}>
                            Explore Events
                        </button>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="booking-card">
                                <div className="booking-header">
                                    <h3>{booking.event?.title || 'Event unavailable'}</h3>
                                    <span 
                                        className="status-badge"
                                        style={{ backgroundColor: getStatusColor(booking.status) }}
                                    >
                                        {getStatusIcon(booking.status)} {booking.status}
                                    </span>
                                </div>
                                
                                <div className="booking-details">
                                    <div className="detail-row">
                                        <span className="label">📅 Date:</span>
                                        <span>{booking.event?.date ? new Date(booking.event.date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : '—'}</span>
                                    </div>
                                    
                                    <div className="detail-row">
                                        <span className="label">📍 Location:</span>
                                        <span>{booking.event?.location || '—'}</span>
                                    </div>
                                    
                                    <div className="detail-row">
                                        <span className="label">🎫 Tickets:</span>
                                        <span>{booking.ticketQuantity} × ${booking.event?.ticketPrice ?? 0}</span>
                                    </div>
                                    
                                    <div className="detail-row">
                                        <span className="label">💰 Total:</span>
                                        <span className="total-price">${booking.totalPrice}</span>
                                    </div>
                                    
                                    <div className="detail-row">
                                        <span className="label">📝 Booking Date:</span>
                                        <span>{new Date(booking.bookingDate).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        })}</span>
                                    </div>
                                </div>

                                {booking.specialRequests && (
                                    <div className="special-requests">
                                        <span className="label">💬 Special Requests:</span>
                                        <p>{booking.specialRequests}</p>
                                    </div>
                                )}

                                <div className="booking-actions">
                                    {booking.status === 'pending' && (
                                        <>
                                            <div className="payment-cta">
                                                <span className="lock">🔒</span>
                                                <span>Secure checkout powered by Stripe</span>
                                            </div>
                                            <button 
                                                className="primary-btn"
                                                disabled={payingId === booking._id}
                                                onClick={() => handleProceedToPayment(booking._id)}
                                            >
                                                {payingId === booking._id ? 'Redirecting…' : 'Proceed to Payment'}
                                            </button>
                                            <button 
                                                className="cancel-btn"
                                                onClick={() => handleCancelBooking(booking._id)}
                                            >
                                                Cancel Booking
                                            </button>
                                        </>
                                    )}
                                    {booking.status !== 'confirmed' && (
                                        <button
                                            className="delete-btn"
                                            onClick={async () => {
                                                if (!window.confirm('Delete this booking permanently?')) return;
                                                try {
                                                    const token = localStorage.getItem('token');
                                                    try {
                                                        await axios.delete(`http://localhost:5000/api/bookings/${booking._id}`, {
                                                            headers: { Authorization: `Bearer ${token}` }
                                                        });
                                                    } catch (delErr) {
                                                        try {
                                                            // Fallback to PUT if DELETE fails
                                                            await axios.put(`http://localhost:5000/api/bookings/delete/${booking._id}`, {}, {
                                                                headers: { Authorization: `Bearer ${token}` }
                                                            });
                                                        } catch (putErr) {
                                                            // Fallback to POST if PUT also fails
                                                            await axios.post(`http://localhost:5000/api/bookings/${booking._id}/delete`, {}, {
                                                                headers: { Authorization: `Bearer ${token}` }
                                                            });
                                                        }
                                                    }
                                                    setMessage({ text: 'Booking deleted successfully!', type: 'success' });
                                                    setBookings(prev => prev.filter(b => b._id !== booking._id));
                                                    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
                                                } catch (error) {
                                                    const serverMsg = error.response?.data?.error;
                                                    const status = error.response?.status;
                                                    const text = serverMsg 
                                                        ? `Error deleting booking (${status || 'server'}): ${serverMsg}`
                                                        : (error.message || 'Error deleting booking');
                                                    setMessage({ text, type: 'error' });
                                                }
                                            }}
                                        >
                                            Delete Booking
                                        </button>
                                    )}
                                    
                                    {booking.status === 'confirmed' && (
                                        <div className="confirmed-info">
                                            <span className="checkmark">✅</span>
                                            <span>Your tickets are confirmed!</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="my-bookings-footer">
                    <button className="close-modal-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MyBookings;











