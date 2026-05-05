import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, wishlistService, chatService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiHeart, FiShoppingCart, FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Skeleton from '../components/Skeleton';
import { Helmet } from 'react-helmet-async';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleMessage = async () => {
    try {
      const res = await chatService.createConversation(product.seller._id, id);
      navigate('/messages', { state: { conversationId: res.data._id } });
    } catch (err) {
      console.error('Failed to create conversation', err);
      toast.error('Failed to start conversation');
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getById(id);
        setProduct(res.data);
      } catch (err) {
        console.error('Failed to fetch product');
        toast.error('Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const addToWishlist = async () => {
    try {
      await wishlistService.add(id);
      toast.success('Added to wishlist');
    } catch (err) {
      console.error(err);
      toast.error('Failed to add to wishlist');
    }
  };

  const getImageUrl = (url) => {
    if (!url) return 'https://via.placeholder.com/600x400';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/uploads') || url.startsWith('uploads')) {
      const cleanPath = url.startsWith('/') ? url : `/${url}`;
      return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${cleanPath}`;
    }
    return url;
  };

  if (loading) {
    return (
      <main className="product-detail-page skeleton-detail" id="main-content">
        <div className="product-layout">
          <div className="product-gallery">
            <Skeleton type="image" height="400px" />
            <div className="thumbnail-grid" style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <Skeleton width="80px" height="80px" />
              <Skeleton width="80px" height="80px" />
              <Skeleton width="80px" height="80px" />
            </div>
          </div>
          <div className="product-info-panel">
            <Skeleton width="100px" height="24px" />
            <Skeleton width="80%" height="48px" />
            <Skeleton width="100%" height="100px" />
            <div style={{ marginTop: '2rem' }}>
              <Skeleton height="80px" borderRadius="12px" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) return (
    <div className="empty-state" style={{ height: '80vh' }}>
      <span>❌</span>
      <h3>Product not found</h3>
      <button className="btn btn-primary" onClick={() => navigate('/marketplace')}>Back to Marketplace</button>
    </div>
  );

  return (
    <main className="product-detail-page" id="main-content">
      <Helmet>
        <title>{`CampusKart | ${product.title}`}</title>
        <meta name="description" content={product.description?.substring(0, 160)} />
      </Helmet>
      
      <div className="product-layout">
        <div className="product-gallery">
          <div className="main-image">
            <img src={getImageUrl(product.images?.[selectedImage || 0])} alt={product.title} />
          </div>
          {product.images?.length > 1 && (
            <div className="thumbnail-grid">
              {product.images.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={getImageUrl(img)} alt={`Thumbnail ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info-panel">
          <span className="badge mb-2">{product.category}</span>
          <h1>{product.title}</h1>
          <p className="product-desc-large">{product.description}</p>
          
          <div className="seller-card card mt-4">
            <div className="seller-info">
              <img src={product.seller.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.seller.name)}&background=4648d4&color=fff`} alt={product.seller.name} className="seller-avatar" />
              <div>
                <h4>{product.seller.name}</h4>
                <p className="text-muted">{product.seller.major} • {product.seller.university}</p>
              </div>
            </div>
          </div>

          <div className="features-grid mt-4">
            {product.features && product.features.map((feature, idx) => (
              <div key={idx} className="feature-item">
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="quick-buy-float glass-panel">
        <div className="float-price">
          <h4>{product.title}</h4>
          <span className="price">₹{product.price?.toLocaleString('en-IN')}</span>
        </div>
        <div className="float-actions">
          {user && product.seller._id === user._id && (
            <button className="btn btn-tertiary" onClick={() => navigate(`/edit-product/${id}`)}>
               Edit Listing
            </button>
          )}
          <button className="btn btn-secondary" onClick={addToWishlist} aria-label="Add to wishlist">
            <FiHeart /> Wishlist
          </button>
          <button className="btn btn-secondary" onClick={handleMessage} aria-label="Message seller">
            <FiMessageCircle /> Message
          </button>
          <button className="btn btn-primary" onClick={() => toast('Cart functionality coming soon!', { icon: '🛒' })}>
            <FiShoppingCart /> Add to Cart
          </button>
        </div>
      </div>
    </main>
  );
};

export default ProductDetail;
