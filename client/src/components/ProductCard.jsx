import React, { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart } from 'react-icons/fi';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const cardRef = useRef(null);

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads') || url.startsWith('uploads')) {
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${cleanPath}`;
    }
    // Handle relative public paths (like seed data)
    return url;
  };

  // 3D tilt on mouse move
  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -10;
    const rotateY = ((x - cx) / cx) * 10;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    // Shine effect
    const shine = card.querySelector('.card-shine');
    if (shine) {
      shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.18) 0%, transparent 65%)`;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = '';
    const shine = card.querySelector('.card-shine');
    if (shine) shine.style.background = 'transparent';
  }, []);

  const imageUrl = getImageUrl(product.images?.[0]);

  return (
    <div
      className="product-card-3d"
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Shine overlay */}
      <div className="card-shine" />

      <div className="product-image-container">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={product.title} 
            className="product-img" 
            loading="lazy"
          />
        ) : (
          <div className="product-img-placeholder">
            <span>{product.category?.[0] || '📦'}</span>
          </div>
        )}
        <button className="wishlist-btn" aria-label="Add to wishlist">
          <FiHeart />
        </button>
        <span className="condition-badge">{product.condition}</span>
        <div className="card-glow" />
      </div>

      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <Link to={`/product/${product._id}`} className="product-title-link">
          <h4 className="product-title-text">{product.title}</h4>
        </Link>
        <p className="product-price">₹{product.price?.toLocaleString('en-IN')}</p>
        <p className="product-description">
          {product.description?.substring(0, 65)}...
        </p>
        <div className="card-actions">
          <Link to={`/product/${product._id}`} className="btn-card-view">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
