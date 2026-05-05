import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../services/api';
import { FiUploadCloud, FiX, FiImage } from 'react-icons/fi';
import './AddProduct.css';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Textbooks',
    condition: 'New'
  });
  const [images, setImages] = useState([]); // Array of File objects
  const [previews, setPreviews] = useState([]); // Array of preview URLs
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFiles = (files) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const maxCount = 5;

    const newFiles = [];
    const newPreviews = [];

    for (const file of files) {
      if (images.length + newFiles.length >= maxCount) {
        alert(`You can upload a maximum of ${maxCount} images.`);
        break;
      }
      if (!validTypes.includes(file.type)) {
        alert(`"${file.name}" is not a supported format. Use JPG, PNG, or WEBP.`);
        continue;
      }
      if (file.size > maxSize) {
        alert(`"${file.name}" exceeds 10MB limit.`);
        continue;
      }
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }

    setImages(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const handleFileInput = (e) => {
    if (e.target.files.length) {
      handleFiles(Array.from(e.target.files));
    }
    // Reset so the same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('condition', formData.condition);
      images.forEach((file) => {
        data.append('images', file);
      });

      await productService.create(data);
      navigate('/marketplace');
    } catch (err) {
      console.error(err);
      alert('Failed to post item');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="add-product-page">
      <div className="add-product-layout">
        <div className="add-product-content">
          <h1>List a New Treasure</h1>
          <p className="text-muted">Provide details for your fellow students. Quality listings sell 3x faster.</p>

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="card form-card">
              <div className="form-group">
                <label className="form-label">Title</label>
                <input type="text" name="title" className="form-input" required onChange={handleChange} value={formData.title} placeholder="What are you selling?" />
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
                <textarea name="description" className="form-input" rows="4" required onChange={handleChange} value={formData.description} placeholder="Describe the item..."></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">Photos <span className="photo-count">{images.length}/5</span></label>

                {/* Image Previews */}
                {previews.length > 0 && (
                  <div className="image-preview-grid">
                    {previews.map((src, idx) => (
                      <div key={idx} className="preview-item">
                        <img src={src} alt={`Preview ${idx + 1}`} />
                        <button type="button" className="remove-image-btn" onClick={() => removeImage(idx)} aria-label="Remove image">
                          <FiX />
                        </button>
                        {idx === 0 && <span className="cover-badge">Cover</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Zone */}
                {images.length < 5 && (
                  <div
                    className={`upload-zone ${dragActive ? 'upload-zone--active' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <FiUploadCloud className="upload-icon" />
                    <p>Drop your photos here<br />or <span className="upload-browse">browse from files</span></p>
                    <span className="text-muted">JPG, PNG, WEBP (Max 10MB per file)</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleFileInput}
                      className="file-input-hidden"
                    />
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary mt-4 w-100" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Post Listing'}
              </button>
            </div>
          </form>
        </div>

        <aside className="trust-sidebar">
          <div className="card bg-primary-light">
            <div className="trust-item">
              <h4>🛡️ Secure Peer-to-Peer</h4>
              <p>All payments are handled securely through the platform.</p>
            </div>
            <div className="trust-item">
              <h4>🎓 Exclusive Network</h4>
              <p>Only verified students can view and purchase.</p>
            </div>
            <div className="trust-item">
              <h4>🌱 Eco-Friendly</h4>
              <p>Give items a second life on campus.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AddProduct;
