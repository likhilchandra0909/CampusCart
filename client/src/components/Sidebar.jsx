import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiShoppingBag, FiArchive, FiMessageSquare,
  FiSettings, FiShoppingCart, FiMenu, FiX
} from 'react-icons/fi';
import './Layout.css';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Listen for hamburger toggle from Navbar via custom event
  useEffect(() => {
    const handler = (e) => setMobileOpen(e.detail?.open ?? !mobileOpen);
    window.addEventListener('toggleSidebar', handler);
    return () => window.removeEventListener('toggleSidebar', handler);
  }, [mobileOpen]);

  if (!user) return null;

  const links = [
    { name: 'Home',        path: '/dashboard',   icon: <FiHome /> },
    { name: 'Marketplace', path: '/marketplace', icon: <FiArchive /> },
    { name: 'My Shop',     path: '/add-product', icon: <FiShoppingBag /> },
    { name: 'Wishlist',    path: '/wishlist',     icon: <FiShoppingCart /> },
    { name: 'Messages',    path: '/messages',     icon: <FiMessageSquare /> },
    { name: 'Settings',    path: '/settings',     icon: <FiSettings /> },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Hamburger toggle (mobile only) */}
      <button
        className="sidebar-hamburger"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <FiX /> : <FiMenu />}
      </button>

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        {/* 3D floating orb inside sidebar */}
        <div className="sidebar-orb orb orb-primary float-slow"
          style={{ width: 160, height: 160, top: -40, right: -40, opacity: 0.25 }}
        />

        <div className="profile-section">
          <div className="sidebar-avatar-wrap">
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4648d4&color=fff&size=80`}
              alt={user.name}
              className="sidebar-avatar"
            />
            <div className="sidebar-avatar-ring" />
          </div>
          <div className="profile-badge">
            <span className="badge-text">Academic Curator</span>
          </div>
          <h3 className="profile-name">{user.name}</h3>
          <p className="profile-status">✓ Verified Student</p>
        </div>

        <nav className="sidebar-nav">
          {links.map((link, i) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                style={{ '--i': i }}
              >
                <span className="link-icon">{link.icon}</span>
                <span className="link-label">{link.name}</span>
                {isActive && <span className="active-indicator" />}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
