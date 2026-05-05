import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import toast from 'react-hot-toast';
import './Settings.css';

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Profile');
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    university: user?.university || '',
    major: user?.major || '',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    directMessages: true,
    priceDrops: false,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await authService.updateProfile(profileData);
      updateUser(res.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.success('Notification settings saved');
  };

  const handle2FAToggle = async () => {
    try {
      const res = await authService.toggle2FA();
      updateUser({ is2FAEnabled: res.data.is2FAEnabled });
      toast.success(res.data.is2FAEnabled ? '2-Step Verification Enabled' : '2-Step Verification Disabled');
    } catch (err) {
      toast.error('Failed to update security settings');
    }
  };

  const handleComingSoon = (feature) => {
    toast(`${feature} coming soon!`, { icon: '🚀' });
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p className="text-muted">Manage your academic profile, security, and preferences.</p>
      </div>

      <div className="settings-layout">
        <aside className="settings-nav card">
          <ul>
            {['Profile', 'Notifications', 'Security', 'Payment Methods'].map(tab => (
              <li 
                key={tab} 
                className={activeTab === tab ? 'active' : ''}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </li>
            ))}
          </ul>
          <div className="settings-user mt-4">
            <span className="text-muted text-sm">{user?.email}</span>
            <button className="btn btn-tertiary w-100 mt-2" onClick={handleLogout}>Log Out</button>
          </div>
        </aside>

        <div className="settings-content">
          {activeTab === 'Profile' && (
            <section className="settings-section">
              <h2>Profile Information</h2>
              <form onSubmit={handleProfileUpdate} className="mt-4">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">University</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={profileData.university} 
                    onChange={(e) => setProfileData({...profileData, university: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Major / Field of Study</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={profileData.major} 
                    onChange={(e) => setProfileData({...profileData, major: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-primary mt-2">Save Profile</button>
              </form>
            </section>
          )}

          {activeTab === 'Notifications' && (
            <section className="settings-section">
              <h2>Notifications</h2>
              <div className="setting-item">
                <div>
                  <h4>Email Alerts</h4>
                  <p className="text-muted">Receive summary of new marketplace items.</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.emailAlerts} 
                    onChange={() => handleNotificationToggle('emailAlerts')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Direct Messages</h4>
                  <p className="text-muted">Notify when a potential buyer messages you.</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.directMessages} 
                    onChange={() => handleNotificationToggle('directMessages')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Price Drops</h4>
                  <p className="text-muted">Alerts when items in your wishlist go on sale.</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={notifications.priceDrops} 
                    onChange={() => handleNotificationToggle('priceDrops')}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </section>
          )}

          {activeTab === 'Security' && (
            <section className="settings-section">
              <h2>Security</h2>
              <div className="setting-item">
                <div>
                  <h4>Two-Factor Authentication</h4>
                  <p className="text-muted">Add an extra layer of security to your account.</p>
                </div>
                <button 
                  className={`btn ${user?.is2FAEnabled ? 'btn-danger' : 'btn-secondary'}`}
                  onClick={handle2FAToggle}
                >
                  {user?.is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                </button>
              </div>
              <div className="setting-item">
                <div>
                  <h4>Active Sessions</h4>
                  <p className="text-muted">Currently logged in on this device.</p>
                </div>
                <button className="btn btn-tertiary" onClick={() => toast('Session history coming soon', { icon: '🔐' })}>Review</button>
              </div>
            </section>
          )}

          {activeTab === 'Payment Methods' && (
            <section className="settings-section">
              <h2>Payment Methods</h2>
              <div className="card payment-card">
                <div className="payment-details">
                  <span className="card-type">Primary Card</span>
                  <h4>•••• •••• •••• 4421</h4>
                </div>
                <div className="payment-expiry">
                  <span className="text-muted text-sm">Expiry</span>
                  <p>12/26</p>
                </div>
              </div>
              <button className="btn btn-outline w-100 mt-4" onClick={() => handleComingSoon('Payments')}>Add New Method</button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
