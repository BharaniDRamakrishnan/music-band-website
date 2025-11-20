import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard({ onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [availabilityStats, setAvailabilityStats] = useState({});
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'events') {
      fetchAllEvents();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'availability') {
      fetchAvailabilityStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const [eventsResponse, bookingsResponse] = await Promise.all([
        axios.get('http://localhost:5000/api/events/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/api/bookings/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
      
      setStats({
        ...eventsResponse.data,
        ...bookingsResponse.data
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      setMessage({ text: 'Error fetching users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/events/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (error) {
      setMessage({ text: 'Error fetching events', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/bookings/admin/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setBookings(response.data);
    } catch (error) {
      setMessage({ text: 'Error fetching bookings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/auth/users/${userId}/role`, 
        { role: newRole },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setMessage({ text: 'User role updated successfully', type: 'success' });
      fetchUsers(); // Refresh user list
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || 'Error updating user role', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/auth/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessage({ text: 'User deleted successfully', type: 'success' });
      fetchUsers(); // Refresh user list
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || 'Error deleting user', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/bookings/admin/${bookingId}/status`, 
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      setMessage({ text: 'Booking status updated successfully', type: 'success' });
      fetchBookings(); // Refresh bookings list
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || 'Error updating booking status', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const deleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/bookings/admin/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessage({ text: 'Booking deleted successfully', type: 'success' });
      fetchBookings(); // Refresh bookings list
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || 'Error deleting booking', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const deleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/events/admin/${eventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessage({ text: 'Event deleted successfully', type: 'success' });
      fetchAllEvents(); // Refresh event list
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || 'Error deleting event', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const fetchAvailabilityStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/events/admin/availability/overview', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAvailabilityStats(response.data);
    } catch (error) {
      setMessage({ text: 'Error fetching availability stats', type: 'error' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-dashboard-overlay">
      <div className="admin-dashboard-modal">
        <div className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="dashboard-tabs">
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
            onClick={() => setActiveTab('events')}
          >
            Events
          </button>
          <button 
            className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            🎟️ Bookings
          </button>
          <button 
            className={`tab-button ${activeTab === 'availability' ? 'active' : ''}`}
            onClick={() => setActiveTab('availability')}
          >
            🎫 Availability
          </button>
        </div>

        <div className="dashboard-content">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h3>Site Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <h4>Total Events</h4>
                  <p className="stat-number">{stats.totalEvents || 0}</p>
                </div>
                <div className="stat-card">
                  <h4>Upcoming Events</h4>
                  <p className="stat-number">{stats.upcomingEvents || 0}</p>
                </div>
                <div className="stat-card">
                  <h4>Completed Events</h4>
                  <p className="stat-number">{stats.completedEvents || 0}</p>
                </div>
                <div className="stat-card">
                  <h4>Cancelled Events</h4>
                  <p className="stat-number">{stats.cancelledEvents || 0}</p>
                </div>
                <div className="stat-card">
                  <h4>Total Bookings</h4>
                  <p className="stat-number">{stats.totalBookings || 0}</p>
                </div>
                <div className="stat-card">
                  <h4>Confirmed Bookings</h4>
                  <p className="stat-number">{stats.confirmedBookings || 0}</p>
                </div>
                <div className="stat-card">
                  <h4>Total Revenue</h4>
                  <p className="stat-number">${stats.totalRevenue || 0}</p>
                </div>
              </div>
              
              {stats.eventsByCategory && stats.eventsByCategory.length > 0 && (
                <div className="category-stats">
                  <h4>Events by Category</h4>
                  <div className="category-list">
                    {stats.eventsByCategory.map((category, index) => (
                      <div key={index} className="category-item">
                        <span className="category-name">{category._id}</span>
                        <span className="category-count">{category.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-section">
              <h3>User Management</h3>
              {loading ? (
                <div className="loading">Loading users...</div>
              ) : (
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>{user.username}</td>
                          <td>{user.email}</td>
                          <td>
                            <select
                              value={user.role}
                              onChange={(e) => updateUserRole(user._id, e.target.value)}
                              className="role-select"
                            >
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>{formatDate(user.createdAt)}</td>
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => deleteUser(user._id)}
                              disabled={user.role === 'admin'}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="events-section">
              <h3>Event Management</h3>
              {loading ? (
                <div className="loading">Loading events...</div>
              ) : (
                <div className="events-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Creator</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {events.map((event) => (
                        <tr key={event._id}>
                          <td>{event.title}</td>
                          <td>{event.createdBy?.username || 'Unknown'}</td>
                          <td>{formatDate(event.date)}</td>
                          <td>
                            <span className={`status-badge ${event.status}`}>
                              {event.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="delete-btn"
                              onClick={() => deleteEvent(event._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div className="bookings-section">
              <h3>Booking Management</h3>
              {loading ? (
                <div className="loading">Loading bookings...</div>
              ) : (
                <div className="bookings-table">
                  <table>
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Event</th>
                        <th>Tickets</th>
                        <th>Total Price</th>
                        <th>Status</th>
                        <th>Booking Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            <div className="user-info">
                              <strong>{booking.user?.username || 'Unknown'}</strong>
                              <small>{booking.user?.email}</small>
                            </div>
                          </td>
                          <td>
                            <div className="event-info">
                              <strong>{booking.event?.title || 'Unknown'}</strong>
                              <small>{formatDate(booking.event?.date)}</small>
                            </div>
                          </td>
                          <td>{booking.ticketQuantity}</td>
                          <td>${booking.totalPrice}</td>
                          <td>
                            <span className={`status-badge ${booking.status}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>{formatDate(booking.bookingDate)}</td>
                          <td>
                            <select
                              value={booking.status}
                              onChange={(e) => updateBookingStatus(booking._id, e.target.value)}
                              className="status-select"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                            <button
                              className="delete-btn"
                              onClick={() => deleteBooking(booking._id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'availability' && (
            <div className="availability-section">
              <h3>Ticket Availability Overview</h3>
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading availability stats...</p>
                </div>
              ) : (
                <>
                  {/* Overall Statistics */}
                  {availabilityStats.totalStats && (
                    <div className="overview-stats">
                      <h4>Overall Statistics</h4>
                      <div className="stats-row">
                        <div className="stat-item">
                          <strong>Total Events:</strong> {availabilityStats.totalStats.totalEvents}
                        </div>
                        <div className="stat-item">
                          <strong>Selected Capacity:</strong> {availabilityStats.totalStats.totalCapacity}
                        </div>
                        <div className="stat-item">
                          <strong>Tickets Sold:</strong> {availabilityStats.totalStats.totalBooked}
                        </div>
                        <div className="stat-item">
                          <strong>Available Tickets:</strong> {availabilityStats.totalStats.totalCapacity - availabilityStats.totalStats.totalBooked}
                        </div>
                        <div className="stat-item">
                          <strong>Total Revenue:</strong> ${availabilityStats.totalStats.totalRevenue}
                        </div>
                        <div className="stat-item">
                          <strong>Avg Occupancy:</strong> {availabilityStats.totalStats.averageOccupancyRate?.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Events Availability Table */}
                  {availabilityStats.events && (
                    <div className="availability-table-container">
                      <h4>Events Ticket Availability</h4>
                      <table className="availability-table">
                        <thead>
                          <tr>
                            <th>Event Title</th>
                            <th>Capacity</th>
                            <th>Sold</th>
                            <th>Available</th>
                            <th>% Sold</th>
                            <th>Revenue</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {availabilityStats.events.map((event) => (
                            <tr key={event.eventId}>
                              <td>
                                <strong>{event.title}</strong>
                              </td>
                              <td>{event.capacity}</td>
                              <td className="sold-column">{event.bookedTickets}</td>
                              <td className="available-column">{event.remainingTickets}</td>
                              <td>
                                <div className="percentage-bar">
                                  <div 
                                    className="percentage-fill" 
                                    style={{ width: `${event.percentageSold}%` }}
                                  ></div>
                                  <span className="percentage-text">{event.percentageSold}%</span>
                                </div>
                              </td>
                              <td className="revenue-column">${event.revenue}</td>
                              <td>
                                <span className={`availability-status ${event.status.toLowerCase().replace(' ', '-')}`}>
                                  {event.status === 'Available' ? '✅ Available' : '🔴 Sold Out'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {(!availabilityStats.events || availabilityStats.events.length === 0) && (
                    <div className="no-data">
                      <p>No availability data found</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
