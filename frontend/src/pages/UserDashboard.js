import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserProfile from '../components/UserProfile';
import MyBookings from '../components/MyBookings';
import BookTicket from '../components/BookTicket';
import './UserDashboard.css';

const UserDashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user info from localStorage
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');
    
    if (token && userRole === 'user') {
      // You can fetch additional user data here if needed
      setUser({ token, role: userRole });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        <p>Welcome to your personal dashboard</p>
      </div>
      
      <Routes>
        <Route path="/" element={<UserProfile />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/book-ticket" element={<BookTicket />} />
        <Route path="*" element={<Navigate to="/user" replace />} />
      </Routes>
    </div>
  );
};

export default UserDashboard;






















