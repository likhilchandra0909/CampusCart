import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './Landing.css';

const Landing = () => {
  const pageRef = useScrollReveal();

  // Parallax effect on hero orbs
  useEffect(() => {
    const handleMouse = (e) => {
      const { innerWidth, innerHeight } = window;
      const xFrac = (e.clientX / innerWidth - 0.5) * 2;
      const yFrac = (e.clientY / innerHeight - 0.5) * 2;

      document.querySelectorAll('.hero-orb').forEach((orb, i) => {
        const depth = (i + 1) * 18;
        orb.style.transform = `translate(${xFrac * depth}px, ${yFrac * depth}px)`;
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  return (
    <div className="landing-page" ref={pageRef}>
      {/* ===== HERO ===== */}
      <header className="hero-section">
        {/* Floating 3D orbs */}
        <div className="hero-orb orb-1 float-orb" />
        <div className="hero-orb orb-2 float-slow" />
        <div className="hero-orb orb-3 float-anim" />

        {/* Rotating grid mesh */}
        <div className="hero-mesh" />

        <div className="hero-content reveal">
          <div className="hero-badge reveal delay-1">
            <span className="badge-dot" />
            🎓 India's Student Marketplace — Now Live 🚀
          </div>
          <h1 className="hero-title reveal delay-2">
            Buy & Sell Within
            <span className="title-block"> Your Campus</span>
          </h1>
          <p className="hero-subtitle reveal delay-3">
            The premium digital concierge for student life. Trade textbooks, gear,
            and services with verified peers in a curated scholarly environment.
          </p>
          <div className="hero-actions reveal delay-4">
            <Link to="/auth" className="btn btn-hero-primary">
              <span>Join the Community</span>
              <span className="btn-arrow">→</span>
            </Link>
            <Link to="/marketplace" className="btn btn-hero-secondary">
              Explore Marketplace
            </Link>
          </div>
        </div>

        {/* 3D floating card preview */}
        <div className="hero-3d-preview float-anim reveal-right delay-3">
          <div className="preview-card perspective-container">
            <div className="preview-card-inner">
              <div className="preview-stat">
                <span className="stat-num">Growing</span>
                <span className="stat-label">Active Listings</span>
              </div>
              <div className="preview-stat">
                <span className="stat-num">100%</span>
                <span className="stat-label">Verified Students</span>
              </div>
              <div className="preview-stat">
                <span className="stat-num">₹0</span>
                <span className="stat-label">Platform Fees</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-dot" />
          <span>Scroll to explore</span>
        </div>
      </header>

      {/* ===== TRENDING ===== */}
      <section className="trending-section">
        <div className="section-label reveal">🔥 What's Hot</div>
        <h2 className="section-title reveal delay-1">Trending in Marketplace</h2>
        <p className="section-desc reveal delay-2">
          Browse the most sought-after items from students in your campus community.
        </p>
        <div className="trending-grid">
          {[
            { icon: '💻', name: 'Dell Laptop (i5, 8GB)', desc: 'Excellent condition, original charger included', price: '₹28,000', tag: 'Electronics' },
            { icon: '📐', name: 'JEE Maths Tutoring', desc: 'IIT grad, top ranker. Guaranteed results', price: '₹300/hr', tag: 'Services' },
            { icon: '🛵', name: 'Honda Activa (2021)', desc: 'Campus commute made easy. Low mileage', price: '₹45,000', tag: 'Transport' },
            { icon: '🛋️', name: 'Hostel Study Table', desc: 'Solid wood, fits any PG or hostel room perfectly', price: '₹1,800', tag: 'Furniture' },
          ].map((item, i) => (
            <div key={item.name} className={`trending-card reveal delay-${i + 1}`}>
              <div className="trending-card-icon">{item.icon}</div>
              <div className="trending-tag">{item.tag}</div>
              <h4>{item.name}</h4>
              <p>{item.desc}</p>
              <div className="trending-price">{item.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="features-section">
        <div className="features-bg-orb orb orb-primary float-slow" />
        <div className="section-label reveal">⚡ Why CampusKart</div>
        <h2 className="section-title reveal delay-1">Built for the Student Community</h2>
        <p className="section-desc reveal delay-2">
          We prioritize security and trust. Every transaction is backed by our student
          verification system and campus-specific safety protocols.
        </p>
        <div className="features-grid">
          {[
            { icon: '🛡️', title: 'Safe Meets', desc: 'Designated campus meetup spots for verified trading.', color: '#4648d4' },
            { icon: '🎓', title: 'Uni Verified', desc: 'Only .edu email users can access the marketplace.', color: '#7c3aed' },
            { icon: '💳', title: 'Instant Pay', desc: 'Secure digital transactions within the campus network.', color: '#ec4899' },
            { icon: '💬', title: 'Easy Chat', desc: 'Direct encrypted messaging with fellow students.', color: '#10b981' },
          ].map((feat, i) => (
            <div key={feat.title} className={`feature-card reveal-zoom delay-${i + 1}`}>
              <div className="feature-icon-wrap" style={{ '--feat-color': feat.color }}>
                <span className="feature-icon">{feat.icon}</span>
              </div>
              <h4>{feat.title}</h4>
              <p>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== STATS BAND ===== */}
      <section className="stats-band reveal">
        {[
          { num: 'New!', label: 'Just Launched' },
          { num: '₹0', label: 'Platform Fee' },
          { num: '100%', label: 'Student-Only' },
          { num: '🇮🇳', label: 'Made in India' },
        ].map((s, i) => (
          <div key={s.label} className={`stats-item reveal-zoom delay-${i + 1}`}>
            <span className="stats-num">{s.num}</span>
            <span className="stats-label">{s.label}</span>
          </div>
        ))}
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section reveal">
        <div className="cta-orb orb orb-secondary float-slow" />
        <div className="cta-content">
          <h2 className="reveal delay-1">Ready to declutter your dorm?</h2>
          <p className="reveal delay-2">
            Be among the first students to buy and sell on CampusKart.
            List your first item in less than 2 minutes — completely free.
          </p>
          <Link to="/auth" className="btn btn-hero-primary reveal delay-3">
            <span>Start Selling Now</span>
            <span className="btn-arrow">🚀</span>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
