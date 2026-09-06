// admin-frontend/src/components/common/ImageUpload.jsx
import React, { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';
import { uploadImage, deleteImage } from '../../api/contentApi';

const ImageUpload = ({ 
  section, 
  field = 'hero_image',
  currentImage, 
  onImageChange,
  label = 'Image',
  altText = '',
  onAltTextChange,
  imageMapping = {} // New prop for mapping
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      const result = await uploadImage(section, file, field);
      
      if (result && result.path) {
        // Store the path as returned by the API (relative path)
        setPreview(result.path);
        // Pass the relative path to parent
        onImageChange(result.path, file.name, result);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image: ' + error.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async () => {
    if (!currentImage && !preview) return;
    
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    setDeleting(true);

    try {
      await deleteImage(section, field);
      setPreview(null);
      onImageChange(null, '');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete image: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Fix: Get the correct image URL
  const getImageUrl = (path) => {
    if (!path) return null;
    
    // If it's already a full URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Remove any /api/v1 prefix if present
    let cleanPath = path;
    if (cleanPath.startsWith('/api/v1')) {
      cleanPath = cleanPath.replace('/api/v1', '');
    }
    
    // Ensure the path starts with /uploads
    if (!cleanPath.startsWith('/uploads')) {
      // If it's just a filename, add /uploads/ prefix
      if (!cleanPath.includes('/')) {
        cleanPath = `/uploads/${cleanPath}`;
      } else {
        // If it has a path but not /uploads, add it
        cleanPath = `/uploads/${cleanPath.replace(/^\/+/, '')}`;
      }
    }
    
    // Get the base URL (without /api/v1)
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    // Remove /api/v1 if present in baseUrl
    const cleanBaseUrl = baseUrl.replace(/\/api\/v1$/, '');
    
    return `${cleanBaseUrl}${cleanPath}`;
  };

  // Get the display name from mapping if available
  const getDisplayName = () => {
    if (imageMapping && imageMapping[field]) {
      return imageMapping[field].original || 'Uploaded image';
    }
    return altText || 'Uploaded image';
  };

  return (
    <div className="image-upload-container">
      {label && <label className="image-upload-label">{label}</label>}
      
      <div className="image-upload-wrapper">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
        />

        {preview || currentImage ? (
          <div className="image-preview">
            <img 
              src={getImageUrl(preview || currentImage)} 
              alt={getDisplayName()}
              onError={(e) => {
                // Fallback if image fails to load
                console.error('Failed to load image:', e.target.src);
                e.target.style.display = 'none';
                // Show placeholder
                const parent = e.target.parentElement;
                const placeholder = document.createElement('div');
                placeholder.className = 'image-placeholder';
                placeholder.innerHTML = '<p>⚠️ Image not found</p>';
                parent.appendChild(placeholder);
              }}
            />
            <div className="image-actions">
              <button 
                type="button" 
                className="image-btn change-btn"
                onClick={triggerFileInput}
                disabled={uploading}
              >
                {uploading ? <FaSpinner className="spinning" /> : <FaUpload />}
                {uploading ? 'Uploading...' : 'Change'}
              </button>
              <button 
                type="button" 
                className="image-btn delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? <FaSpinner className="spinning" /> : <FaTrash />}
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
            {imageMapping && imageMapping[field] && (
              <div className="image-info">
                <span>Original: {imageMapping[field].original}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="image-placeholder" onClick={triggerFileInput}>
            <FaUpload size={32} />
            <p>Click to upload image</p>
            <span>JPEG, PNG, WEBP, GIF (max 5MB)</span>
            {uploading && <FaSpinner className="spinning" />}
          </div>
        )}
      </div>

      {onAltTextChange && (
        <div className="image-alt-input">
          <label>Alt Text</label>
          <input
            type="text"
            value={altText || ''}
            onChange={(e) => onAltTextChange(e.target.value)}
            placeholder="Image description for accessibility"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;