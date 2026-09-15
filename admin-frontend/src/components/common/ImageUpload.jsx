// admin-frontend/src/components/common/ImageUpload.jsx
import React, { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaSpinner } from 'react-icons/fa';
import { 
  uploadContentImage, 
  deleteContentImage,
  uploadServiceImage,
  deleteServiceImage,
  uploadProjectImage,
  deleteProjectImage
} from '../../api/contentApi';

const ImageUpload = ({ 
  section, 
  field = 'hero_image',
  currentImage, 
  onImageChange,
  label = 'Image',
  altText = '',
  onAltTextChange,
  imageMapping = {},
  itemId = null // For services/projects/team items
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [preview, setPreview] = useState(currentImage || null);
  const fileInputRef = useRef(null);

  // Determine which upload function to use based on section
  const getUploadFunction = () => {
    if (section === 'services' && itemId) {
      return uploadServiceImage;
    } else if (section === 'projects' && itemId) {
      return uploadProjectImage;
    } else if (section === 'team') {
      // Team uses content table for avatar images or separate endpoint
      return uploadContentImage;
    } else {
      // hero, about, contact - content table
      return uploadContentImage;
    }
  };

  // Determine which delete function to use based on section
  const getDeleteFunction = () => {
    if (section === 'services' && itemId) {
      return deleteServiceImage;
    } else if (section === 'projects' && itemId) {
      return deleteProjectImage;
    } else {
      return deleteContentImage;
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      let result;
      const uploadFn = getUploadFunction();
      
      if (section === 'services' && itemId) {
        result = await uploadFn(itemId, file);
      } else if (section === 'projects' && itemId) {
        result = await uploadFn(itemId, file);
      } else {
        result = await uploadFn(section, file, field);
      }
      
      if (result && result.path) {
        setPreview(result.path);
        onImageChange(result.path, file.name, result);
      } else if (result && result.image_path) {
        setPreview(result.image_path);
        onImageChange(result.image_path, file.name, result);
      } else {
        const path = result.path || result.image || result.url || result.file_path;
        if (path) {
          setPreview(path);
          onImageChange(path, file.name, result);
        } else {
          throw new Error('No image path returned from server');
        }
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
      const deleteFn = getDeleteFunction();
      
      if (section === 'services' && itemId) {
        await deleteFn(itemId);
      } else if (section === 'projects' && itemId) {
        await deleteFn(itemId);
      } else {
        await deleteFn(section, field);
      }
      
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

  const getImageUrl = (path) => {
    if (!path) return null;
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    let cleanPath = path;
    
    if (cleanPath.startsWith('/api/v1')) {
      cleanPath = cleanPath.replace('/api/v1', '');
    }
    
    if (!cleanPath.startsWith('/uploads') && !cleanPath.startsWith('uploads')) {
      if (!cleanPath.includes('/')) {
        cleanPath = `/uploads/${cleanPath}`;
      } else {
        cleanPath = `/uploads/${cleanPath.replace(/^\/+/, '')}`;
      }
    } else if (cleanPath.startsWith('uploads/')) {
      cleanPath = `/${cleanPath}`;
    }
    
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    const cleanBaseUrl = baseUrl.replace(/\/api\/v1$/, '');
    
    return `${cleanBaseUrl}${cleanPath}`;
  };

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

        {(preview || currentImage) ? (
          <div className="image-preview">
            <img 
              src={getImageUrl(preview || currentImage)} 
              alt={getDisplayName()}
              onError={(e) => {
                console.error('Failed to load image:', e.target.src);
                e.target.style.display = 'none';
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