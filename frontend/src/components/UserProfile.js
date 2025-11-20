import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfile.css';

function UserProfile({ onClose }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    avatar: '',
    location: '',
    website: '',
    socialMedia: {
      twitter: '',
      instagram: '',
      facebook: ''
    }
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    eventUpdates: true,
    newsletter: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.profile) {
        setProfile(response.data.profile);
      }
      if (response.data.preferences) {
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      setMessage({ text: 'Error fetching profile', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  const handleProfileChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfile(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfile(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handlePreferencesChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const saveProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/profile', {
        profile,
        preferences
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || 'Error updating profile', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters', type: 'error' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (error) {
      setMessage({ 
        text: error.response?.data?.error || 'Error changing password', 
        type: 'error' 
      });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-profile-overlay">
      <div className="user-profile-modal">
        <div className="profile-header">
          <h2>User Profile</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="profile-tabs">
          <button 
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button 
            className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button 
            className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => setActiveTab('password')}
          >
            Password
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={profile.firstName || ''}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={profile.lastName || ''}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>

                <div className="form-group full-width">
                  <label htmlFor="bio">Bio</label>
                  <textarea
                    id="bio"
                    value={profile.bio || ''}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    value={profile.location || ''}
                    onChange={(e) => handleProfileChange('location', e.target.value)}
                    placeholder="City, Country"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="website">Website</label>
                  <input
                    type="url"
                    id="website"
                    value={profile.website || ''}
                    onChange={(e) => handleProfileChange('website', e.target.value)}
                    placeholder="https://yourwebsite.com"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Social Media</label>
                  <div className="social-media-inputs">
                    <input
                      type="text"
                      placeholder="Twitter username"
                      value={profile.socialMedia.twitter || ''}
                      onChange={(e) => handleProfileChange('socialMedia.twitter', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Instagram username"
                      value={profile.socialMedia.instagram || ''}
                      onChange={(e) => handleProfileChange('socialMedia.instagram', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Facebook username"
                      value={profile.socialMedia.facebook || ''}
                      onChange={(e) => handleProfileChange('socialMedia.facebook', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="save-button"
                  onClick={saveProfile}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="preferences-section">
              <h3>Notification Preferences</h3>
              <div className="preferences-list">
                <div className="preference-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => handlePreferencesChange('emailNotifications', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Email Notifications
                  </label>
                  <p className="preference-description">Receive important updates via email</p>
                </div>

                <div className="preference-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferences.eventUpdates}
                      onChange={(e) => handlePreferencesChange('eventUpdates', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Event Updates
                  </label>
                  <p className="preference-description">Get notified about event changes and updates</p>
                </div>

                <div className="preference-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={preferences.newsletter}
                      onChange={(e) => handlePreferencesChange('newsletter', e.target.checked)}
                    />
                    <span className="checkmark"></span>
                    Newsletter
                  </label>
                  <p className="preference-description">Receive our monthly newsletter with music updates</p>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="save-button"
                  onClick={saveProfile}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'password' && (
            <div className="password-section">
              <h3>Change Password</h3>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                    placeholder="Enter your current password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button 
                  className="save-button"
                  onClick={changePassword}
                  disabled={loading}
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile;

