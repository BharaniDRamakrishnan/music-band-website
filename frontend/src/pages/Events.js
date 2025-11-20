import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AddEvent from '../components/AddEvent';
import EditEvent from '../components/EditEvent';
import BookTicket from '../components/BookTicket';
import './Events.css';
import img1 from './img1.jpg';
import img2 from './img2.jpg';
import img3 from './img3.jpg';
import img4 from './img4.jpg';
import { useLocation, useNavigate } from 'react-router-dom';

function Events() {
  const location = useLocation();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEditEvent, setShowEditEvent] = useState(false);
  const [showBookTicket, setShowBookTicket] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    checkAuthStatus();
    fetchEvents();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    
    if (token && storedUsername) {
      setIsLoggedIn(true);
      setUsername(storedUsername);
      setUserRole(storedRole);
    }
  };

  // Open add modal when visiting /events/add
  useEffect(() => {
    if (location.pathname === '/events/add') {
      setShowAddEvent(true);
    }
  }, [location.pathname]);

  const fetchEvents = async () => {
    try {
      console.log('Fetching events from API...');
      const response = await axios.get('http://localhost:5000/api/events');
      console.log('Events received:', response.data);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const defaultImages = [img1, img2, img3, img4];
  const getEventImage = (event, index) => {
    if (event.image && String(event.image).trim() !== '') return event.image;
    return defaultImages[index % defaultImages.length];
  };

  const handleEventAdded = (newEvent) => {
    setEvents(prevEvents => [newEvent, ...prevEvents]);
  };

  const handleEventDeleted = (eventId) => {
    setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        handleEventDeleted(eventId);
      } catch (error) {
        console.error('Error deleting event:', error);
        alert('Error deleting event. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="events-loading">
        <div className="loading-spinner"></div>
        <p>Loading events...</p>
      </div>
    );
  }

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>Music Events</h1>
        <p>Discover amazing music events and concerts</p>
        
        {isLoggedIn && (
          <div className="user-section">
            <span className="welcome-text">Welcome, {username}!</span>
            
            {/* Admin Controls */}
            {userRole === 'admin' && (
              <button 
                className="add-event-btn"
                onClick={() => setShowAddEvent(true)}
              >
                + Add New Event
              </button>
            )}
          </div>
        )}
      </div>

      {/* All Events Section */}
      <div className="all-events-section">
        <h2>Upcoming Events</h2>
        {events.length === 0 ? (
          <div className="no-events">
            <p>No events scheduled yet.</p>
            {isLoggedIn && userRole === 'admin' && (
              <button 
                className="add-first-event-btn"
                onClick={() => setShowAddEvent(true)}
              >
                Be the first to add an event!
              </button>
            )}
          </div>
        ) : (
          <div className="events-grid">
            {events.map((event, index) => (
              <div key={event._id} className="event-card">
                <div className="event-image">
                  <img src={getEventImage(event, index)} alt={event.title} />
                </div>
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  <div className="event-details">
                    <span className="event-date">📅 {formatDate(event.date)}</span>
                    <span className="event-location">📍 {event.location}</span>
                    <span className="event-category">🎵 {event.category}</span>
                    {event.ticketPrice > 0 && (
                      <span className="event-price">💰 ${event.ticketPrice}</span>
                    )}
                    <span className="event-creator">👤 by {event.createdBy?.username || 'Unknown'}</span>
                    
                    {/* Ticket Availability */}
                    {event.capacity && (
                      <div className="ticket-availability">
                        {event.seatsLeft <= 0 ? (
                          <span className="sold-out-badge">🔴 SOLD OUT</span>
                        ) : (
                          <span className="tickets-left">🎫 {event.seatsLeft} tickets left</span>
                        )}
                        <span className="capacity-info">({event.capacity} total capacity)</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="event-actions">
                    {/* Book Tickets Button - Only for Users */}
                    {isLoggedIn && userRole === 'user' && (
                      <>
                        {event.seatsLeft > 0 ? (
                          <button 
                            className="book-ticket-btn"
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowBookTicket(true);
                            }}
                          >
                            🎫 Book Tickets
                          </button>
                        ) : (
                          <button 
                            className="sold-out-btn"
                            disabled
                          >
                            🔴 Sold Out
                          </button>
                        )}
                      </>
                    )}
                    
                    {/* Admin Controls - Only for Admins */}
                    {isLoggedIn && userRole === 'admin' && (
                      <div className="admin-controls">
                        <button 
                          className="edit-event-btn"
                          onClick={() => {
                            setSelectedEvent(event);
                            setShowEditEvent(true);
                          }}
                        >
                          ✏️ Edit
                        </button>
                        <button 
                          className="delete-event-btn"
                          onClick={() => handleDeleteEvent(event._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Event Modal - Only for Admins */}
      {showAddEvent && (
        <AddEvent 
          onEventAdded={handleEventAdded}
          onClose={() => {
            setShowAddEvent(false);
            if (location.pathname === '/events/add') {
              navigate('/events', { replace: true });
            }
          }}
        />
      )}

      {/* Edit Event Modal - Only for Admins */}
      {showEditEvent && selectedEvent && (
        <EditEvent
          event={selectedEvent}
          onEventUpdated={(updated) => {
            setEvents(prev => prev.map(ev => ev._id === updated._id ? updated : ev));
          }}
          onClose={() => {
            setShowEditEvent(false);
            setSelectedEvent(null);
          }}
        />
      )}

      {/* Book Ticket Modal - Only for Users */}
      {showBookTicket && selectedEvent && (
        <BookTicket 
          event={selectedEvent}
          onClose={() => {
            setShowBookTicket(false);
            setSelectedEvent(null);
          }}
          onBookingSuccess={() => {
            // Refresh events if needed
            fetchEvents();
          }}
        />
      )}
    </div>
  );
}

export default Events;

