import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/api';
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiBell, FiMessageSquare, FiPackage, FiInfo } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './Layout.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.get();
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => { setMobileOpen(false); setShowNotifs(false); }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleNotifClick = async (notif) => {
    try {
      await notificationService.read(notif._id);
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      
      if (notif.type === 'MESSAGE') {
        navigate('/messages', { state: { conversationId: notif.relatedId } });
      }
      setShowNotifs(false);
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationService.readAll();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <nav className={`navbar glass-panel ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="navbar-container">
          <button 
            className="hamburger-btn" 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>

          <Link to="/dashboard" className="logo logo-3d">
            <span className="logo-campus">Campus</span>
            <span className="logo-kart">Kart</span>
          </Link>

          <div className="search-bar">
            <label htmlFor="nav-search" className="visually-hidden">Search marketplace</label>
            <FiSearch className="search-icon" />
            <input
              id="nav-search"
              type="text"
              placeholder="Search marketplace..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <div className="nav-links">
            <Link to="/marketplace" className={`nav-link ${location.pathname === '/marketplace' ? 'active' : ''}`}>Marketplace</Link>
            <Link to="/wishlist" className={`nav-link ${location.pathname === '/wishlist' ? 'active' : ''}`}>Wishlist</Link>
            
            <div className="nav-actions">
              <div className="notif-wrapper">
                <button 
                  className="icon-btn nav-icon-btn" 
                  onClick={() => setShowNotifs(!showNotifs)}
                  aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
                >
                  <FiBell />
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </button>
                
                <AnimatePresence>
                  {showNotifs && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="notif-dropdown glass-panel shadow-lg"
                    >
                      <div className="notif-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && <button onClick={markAllRead}>Mark all read</button>}
                      </div>
                      <div className="notif-list">
                        {notifications.length > 0 ? (
                          notifications.map(notif => (
                            <div 
                              key={notif._id} 
                              className={`notif-item ${!notif.isRead ? 'unread' : ''}`}
                              onClick={() => handleNotifClick(notif)}
                            >
                              <div className={`notif-icon-box ${notif.type.toLowerCase()}`}>
                                {notif.type === 'MESSAGE' && <FiMessageSquare />}
                                {notif.type === 'SALE' && <FiPackage />}
                                {notif.type === 'SYSTEM' && <FiInfo />}
                              </div>
                              <div className="notif-content">
                                <h4>{notif.title}</h4>
                                <p>{notif.content}</p>
                                <span className="notif-time">{new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="notif-empty">
                            <p>All caught up! 🎉</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/settings" className="user-profile-nav">
                <img
                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4648d4&color=fff`}
                  alt="Profile"
                  className="nav-avatar"
                />
                <span className="user-name">{user.name?.split(' ')[0]}</span>
              </Link>
              <button className="btn btn-outline-nav" onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="mobile-search-bar">
        <FiSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Search marketplace..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleSearch}
        />
      </div>
    </>
  );
};

export default Navbar;
