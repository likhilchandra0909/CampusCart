import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-copyright">
          © 2024 CampusCart Marketplace. For Students, By Students.
        </div>
        <div className="footer-links">
          <Link to="#">Terms of Service</Link>
          <Link to="#">Privacy Policy</Link>
          <Link to="#">Campus Safety</Link>
          <Link to="#">Support</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
