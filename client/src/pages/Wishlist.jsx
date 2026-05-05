import React, { useState, useEffect } from 'react';
import { wishlistService } from '../services/api';
import { FiTrash2 } from 'react-icons/fi';
import './Wishlist.css';

const Wishlist = () => {
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await wishlistService.get();
        setWishlist(res.data);
      } catch (err) {
        console.error('Failed to fetch wishlist');
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      const res = await wishlistService.remove(productId);
      setWishlist(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads') || url.startsWith('uploads')) {
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${cleanPath}`;
    }
    return url;
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-header">
        <h1>Your Curated Wishlist</h1>
        <p className="text-muted">{wishlist.products.length} items saved for your next academic term.</p>
      </div>

      <div className="wishlist-content">
        <div className="wishlist-items">
          {loading ? (
            <p>Loading...</p>
          ) : wishlist.products.length === 0 ? (
            <div className="card p-4 text-center">
              <p>Your wishlist is empty.</p>
            </div>
          ) : (
            wishlist.products.map(product => (
              <div key={product._id} className="card wishlist-card">
                <img src={getImageUrl(product.images?.[0])} alt={product.title} className="wishlist-img" />
                <div className="wishlist-details">
                  <h4>{product.title}</h4>
                  <p className="wishlist-desc">{product.description.substring(0, 80)}...</p>
                  <p className="price mt-2">₹{product.price.toLocaleString('en-IN')}</p>
                </div>
                <div className="wishlist-actions">
                  <button className="btn btn-primary">Add to Cart</button>
                  <button className="icon-btn text-error" onClick={() => handleRemove(product._id)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="ai-curator-sidebar">
          <div className="card ai-card">
            <div className="ai-icon">✨</div>
            <h3>AI Curator's Suggestions</h3>
            <p className="text-muted">Based on your saved items, we found 3 study guides you might need this term.</p>
            <button className="btn btn-secondary w-100 mt-4">View Suggestions</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Wishlist;
