import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Marketplace from './pages/Marketplace';
import ProductDetail from './pages/ProductDetail';
import AddProduct from './pages/AddProduct';
import Wishlist from './pages/Wishlist';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import EditProduct from './pages/EditProduct';
import DashboardLayout from './components/DashboardLayout';

import './App.css';
import './animations.css';

import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--background)'
    }}>
      <div className="loading-spinner" />
    </div>
  );
  if (!user) return <Navigate to="/auth" />;
  return children;
};

// Scroll Progress Bar + Cursor Glow
const GlobalEffects = () => {
  const progressRef = useRef(null);
  const cursorRef = useRef(null);

  useEffect(() => {
    const bar = progressRef.current;
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const totalHeight = docHeight - winHeight;
      const progress = totalHeight > 0 ? (scrolled / totalHeight) * 100 : 0;
      if (bar) bar.style.width = `${progress}%`;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    const handleMouseMove = (e) => {
      if (cursor) {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div id="scroll-progress" role="progressbar" aria-label="Scroll Progress" ref={progressRef} />
      <div id="cursor-glow" aria-hidden="true" ref={cursorRef} />
    </>
  );
};

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <a href="#main-content" className="skip-link">Skip to content</a>
            <GlobalEffects />
            <div className="app">
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />

                {/* Authenticated Routes wrapped in DashboardLayout */}
                <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/add-product" element={<AddProduct />} />
                  <Route path="/edit-product/:id" element={<EditProduct />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/messages" element={<Messages />} />
                </Route>
              </Routes>
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(70,72,212,0.15)',
                  boxShadow: '0 20px 40px rgba(70,72,212,0.12)',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-body)',
                }
              }}
            />
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
