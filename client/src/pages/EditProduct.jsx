import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { FiUploadCloud, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import './AddProduct.css';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Textbooks',
    condition: 'New'
  });
  const [images, setImages] = useState([]); // Array of File objects
  const [previews, setPreviews] = useState([]); // Array of preview URLs
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await productService.getById(id);
        const p = res.data;
        setFormData({
          title: p.title,
          description: p.description,
          price: p.price,
          category: p.category,
          condition: p.condition
        });
        setPreviews(p.images || []);
      } catch (err) {
        toast.error('Failed to load product');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFiles = (files) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxCount = 5;

    const newFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (images.length + newFiles.length >= maxCount) {
        toast.error(`Maximum ${maxCount} images allowed`);
        break;
      }
      if (!validTypes.includes(file.type)) {
        toast.error(`"${file.name}" is not supported`);
        continue;
      }
      if (file.size > maxSize) {
        toast.error(`"${file.name}" is too large`);
        continue;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    // When new files are uploaded, we start a fresh "new images" list
    setImages(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleFileInput = (e) => {
    if (e.target.files.length) {
      handleFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  const removeImage = (index) => {
    const previewToRemove = previews[index];
    if (previewToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(previewToRemove);
      // Find the file index in the 'images' array
      // This is slightly tricky if we mix existing and new, 
      // but here we just append new ones to the end of previews.
      // So we need to find which 'new file' it corresponds to.
      const blobPreviews = previews.filter(p => p.startsWith('blob:'));
      const blobIndex = blobPreviews.indexOf(previewToRemove);
      setImages(prev => prev.filter((_, i) => i !== blobIndex));
    }
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      
      // Only append images if new ones were added
      if (images.length > 0) {
        images.forEach((file) => {
          data.append('images', file);
        });
      }

      await productService.update(id, data);
      toast.success('Listing updated successfully!');
      navigate(`/product/${id}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-5 text-center">Loading product data...</div>;

  return (
    <div className="add-product-page">
      <div className="add-product-layout">
        <div className="add-product-content">
          <h1>Edit Your Treasure</h1>
          <p className="text-muted">Update the details of your listing.</p>

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="card form-card">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" name="title" className="form-input" required onChange={handleChange} value={formData.title} />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label className="form-label">Category</label>
                  <select name="category" className="form-input" onChange={handleChange} value={formData.category}>
                    <option>Textbooks</option>
                    <option>Electronics</option>
                    <option>Furniture</option>
                    <option>Audio</option>
                    <option>Accessories</option>
                  </select>
                </div>
                <div className="form-group flex-1">
                  <label className="form-label">Price (₹)</label>
                  <input type="number" name="price" className="form-input" min="0" step="0.01" required onChange={handleChange} value={formData.price} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Condition</label>
                <div className="radio-group">
                  {['New', 'Like New', 'Good', 'Fair'].map(cond => (
                    <label key={cond} className="radio-label">
                      <input type="radio" name="condition" value={cond} checked={formData.condition === cond} onChange={handleChange} />
                      {cond}
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea name="description" className="form-input" rows="4" required onChange={handleChange} value={formData.description}></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Photos <span className="photo-count">{previews.length}/5</span></label>
                
                {previews.length > 0 && (
                  <div className="image-preview-grid">
                    {previews.map((src, idx) => (
                      <div key={idx} className="preview-item">
                        <img src={src} alt="Preview" />
                        <button type="button" className="remove-image-btn" onClick={() => removeImage(idx)}>
                          <FiX />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {previews.length < 5 && (
                  <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
                    <FiUploadCloud className="upload-icon" />
                    <p>Click to upload new photos<br /><span className="text-muted">(Uploading new photos will replace current ones)</span></p>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileInput} className="file-input-hidden" />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary mt-4 w-100" disabled={updating}>
                {updating ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        <aside className="trust-sidebar">
          <div className="card bg-primary-light">
             <div className="trust-item">
              <h4>📝 Accurate Info</h4>
              <p>Keeping your listing up to date helps buyers make informed decisions.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default EditProduct;
