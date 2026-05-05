import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { productService } from '../services/api';
import ProductCard from '../components/ProductCard';
import Skeleton from '../components/Skeleton';
import { Helmet } from 'react-helmet-async';
import './Marketplace.css';

const Marketplace = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSearch = queryParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  const categories = ['Textbooks', 'Electronics', 'Furniture', 'Audio', 'Accessories'];
  const conditions = ['New', 'Like New', 'Good', 'Fair'];

  // Update searchQuery when URL changes (e.g. from Navbar search)
  useEffect(() => {
    const newSearch = new URLSearchParams(location.search).get('search') || '';
    setSearchQuery(newSearch);
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (selectedCondition) params.condition = selectedCondition;
        if (searchQuery) params.search = searchQuery;
        
        const res = await productService.getAll(params);
        setProducts(res.data);
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategory, selectedCondition, searchQuery]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(prev => prev === category ? '' : category);
  };

  const handleConditionChange = (condition) => {
    setSelectedCondition(prev => prev === condition ? '' : condition);
  };

  return (
    <main className="marketplace-page" id="main-content">
      <Helmet>
        <title>CampusKart | Marketplace</title>
        <meta name="description" content="Shop textbooks, electronics, and more from fellow students." />
      </Helmet>
      
      <div className="marketplace-layout">
        <aside className="filters-sidebar">
          <h3>Categories</h3>
          <ul className="filter-list">
            {categories.map(cat => (
              <li key={cat}>
                <label className="filter-label">
                  <input 
                    type="checkbox" 
                    checked={selectedCategory === cat}
                    onChange={() => handleCategoryChange(cat)}
                  /> 
                  {cat}
                </label>
              </li>
            ))}
          </ul>

          <h3 className="mt-4">Condition</h3>
          <ul className="filter-list">
            {conditions.map(cond => (
              <li key={cond}>
                <label className="filter-label">
                  <input 
                    type="checkbox" 
                    checked={selectedCondition === cond}
                    onChange={() => handleConditionChange(cond)}
                  /> 
                  {cond}
                </label>
              </li>
            ))}
          </ul>

          <button 
            className="btn btn-tertiary w-100 mt-4"
            onClick={() => {
              setSelectedCategory('');
              setSelectedCondition('');
              setSearchQuery('');
            }}
          >
            Clear Filters
          </button>
        </aside>

        <div className="marketplace-content">
          <div className="marketplace-header">
            <div>
              <h1>Campus Marketplace</h1>
              <p>
                {searchQuery 
                  ? `Showing results for "${searchQuery}"` 
                  : "Discover essential textbooks, gear, and supplies curated specifically for the academic journey."}
              </p>
            </div>
          </div>

          <div className="products-grid">
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="product-card-3d skeleton-card">
                  <Skeleton type="image" height="220px" />
                  <div style={{ padding: '1rem' }}>
                    <Skeleton type="text" width="40%" />
                    <Skeleton type="text" width="80%" height="1.5rem" />
                    <Skeleton type="text" width="30%" />
                    <Skeleton type="text" width="90%" />
                  </div>
                </div>
              ))
            ) : products.length > 0 ? (
              products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="empty-state">
                <span>📦</span>
                <h3>No items found</h3>
                <p>Try adjusting your filters or search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Marketplace;
