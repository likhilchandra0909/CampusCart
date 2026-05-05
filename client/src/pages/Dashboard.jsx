import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { productService, dashboardService } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [recommended, setRecommended] = useState([]);
  const [stats, setStats] = useState({
    productsAdded: 0,
    productsBought: 0,
    recentProducts: [],
    recentOrders: []
  });
  const [loadingStats, setLoadingStats] = useState(true);
  const pageRef = useScrollReveal();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, statsRes] = await Promise.all([
          productService.getAll({ limit: 4 }),
          dashboardService.getStats()
        ]);
        setRecommended(recRes.data.slice(0, 4));
        setStats(statsRes.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchData();
  }, []);

  const activityList = [
    ...stats.recentProducts.map(p => ({
      icon: '📦',
      bg: '#e0e7ff',
      title: `Item Added: ${p.title}`,
      sub: `Listed on ${new Date(p.createdAt).toLocaleDateString()}`,
      time: new Date(p.createdAt)
    })),
    ...stats.recentOrders.map(o => ({
      icon: '🛍️',
      bg: '#dcfce7',
      title: `Item Bought: ${o.productName}`,
      sub: `Purchased on ${new Date(o.createdAt).toLocaleDateString()}`,
      time: new Date(o.createdAt)
    }))
  ].sort((a, b) => b.time - a.time).slice(0, 5);

  return (
    <div className="dashboard-page" ref={pageRef}>
      {/* ── Hero ── */}
      <header className="dashboard-hero reveal">
        <div className="dash-hero-orb orb orb-primary float-slow" />
        <div className="dash-hero-content">
          <div className="welcome-pill reveal delay-1">
            👋 Welcome back, {user?.name?.split(' ')[0] || 'Student'}
          </div>
          <h1 className="reveal delay-2">Your Campus, Simplified.</h1>
          <p className="reveal delay-3">
            Trade textbooks, electronics, and dorm essentials with verified students
            in your community.
          </p>
          <div className="dashboard-actions reveal delay-4">
            <Link to="/marketplace" className="action-card primary-action">
              <span className="action-icon">🛒</span>
              <div>
                <h3>Start Buying</h3>
                <p>Explore 2,400+ listings from students near you.</p>
              </div>
              <span className="action-arrow">→</span>
            </Link>
            <Link to="/add-product" className="action-card secondary-action">
              <span className="action-icon">📦</span>
              <div>
                <h3>List an Item</h3>
                <p>Turn your unused campus gear into cash.</p>
              </div>
              <span className="action-arrow">→</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* ── recommended ── */}
        <div className="main-column">
          <section className="recommended-section">
            <div className="section-header reveal">
              <div>
                <h2>Recommended for You</h2>
                <p className="text-muted">Based on your recent activity</p>
              </div>
              <Link to="/marketplace" className="see-all-link">See all →</Link>
            </div>
            <div className="recommended-grid">
              {recommended.length > 0 ? (
                recommended.map((product, i) => (
                  <div key={product._id} className={`reveal delay-${i + 1}`}>
                    <ProductCard product={product} />
                  </div>
                ))
              ) : (
                <div className="empty-state reveal">
                  <span>🎯</span>
                  <p>No listings yet. Be the first to list something!</p>
                  <Link to="/add-product" className="btn-hero-primary-sm">Add Product</Link>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── sidebar stats ── */}
        <aside className="side-column">
          <div className="stats-card reveal">
            <div className="stats-card-header">
              <h2>Your Stats</h2>
              <span className="live-badge">● Live</span>
            </div>
            <div className="stat-item reveal delay-1">
              <span className="stat-label">Total Products Added</span>
              <span className="stat-value text-gradient">
                {stats.productsAdded}
              </span>
            </div>
            <div className="stat-item reveal delay-2">
              <span className="stat-label">Total Products Bought</span>
              <span className="stat-value">{stats.productsBought}</span>
            </div>
            <div className="stat-item reveal delay-3">
              <span className="stat-label">Verified Account</span>
              <span className="stat-value">✅</span>
            </div>
          </div>

          <div className="activity-card reveal delay-2">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {activityList.length > 0 ? (
                activityList.map((item, i) => (
                  <div key={i} className={`activity-item reveal delay-${i + 1}`}>
                    <div className="activity-icon" style={{ background: item.bg }}>
                      {item.icon}
                    </div>
                    <div className="activity-details">
                      <h4>{item.title}</h4>
                      <p>{item.sub}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-activity">
                  <p>No activity yet</p>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Dashboard;
