import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Authentication failed');
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-branding">
        <h1>Elevate Your<br />Campus Experience.</h1>
        <p>The scholarly marketplace designed for students who value editorial quality and seamless peer-to-peer exchange.</p>
        <div className="auth-stats">
          <span className="badge">Joined by 12k+ students this semester</span>
        </div>
      </div>
      
      <div className="auth-form-container">
        <div className="card auth-card">
          <h2>{isLogin ? 'Welcome Back' : 'Create your account'}</h2>
          <p className="text-muted">{isLogin ? 'Enter your credentials.' : 'Join the verified academic community.'}</p>
          
          {error && <div className="alert-error">{error}</div>}

          <div className="google-auth-wrapper mt-4 mb-4" style={{ display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in failed')}
              useOneTap
            />
          </div>
          
          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input type="text" name="name" className="form-input" required onChange={handleChange} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" name="email" className="form-input" required onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" className="form-input" required onChange={handleChange} />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              {isLogin ? 'Sign In' : 'Continue'}
            </button>
          </form>

          <p className="auth-switch">
             {isLogin ? "Don't have an account? " : "Already verified? "} 
            <span onClick={() => setIsLogin(!isLogin)} className="text-gradient pointer">
              {isLogin ? 'Sign Up' : 'Sign In instead'}
            </span>
          </p>

          {!isLogin && (
            <p className="auth-terms">
              By signing up, you agree to the <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>. © 2024 CampusCart Marketplace.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
