// admin-frontend/src/components/editors/AboutEditor.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import TextAreaField from '../common/TextAreaField';
import ImageUpload from '../common/ImageUpload';
import { FaTrash, FaPlus } from "react-icons/fa";

const AboutEditor = ({ data, onChange }) => {
  const defaultData = {
    tag: '',
    title: '',
    description: '',
    features: [],
    image_1: null,
    image_1_alt: '',
    image_2: null,
    image_2_alt: ''
  };

  const [formData, setFormData] = useState({ ...defaultData, ...data });

  useEffect(() => {
    if (data) {
      setFormData(prev => ({
        ...defaultData,
        ...data,
        features: data.features || []
      }));
    }
  }, [data]);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleImageChange = (field, path, filename, uploadResult) => {
    const updated = { 
      ...formData, 
      [field]: path,
      [`${field}_filename`]: filename,
      [`${field}_upload`]: uploadResult
    };
    setFormData(updated);
    onChange(updated);
  };

  const handleAltTextChange = (field, value) => {
    const updated = { ...formData, [`${field}_alt`]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleFeatureChange = (index, field, value) => {
    const updatedFeatures = [...(formData.features || [])];
    updatedFeatures[index] = { ...updatedFeatures[index], [field]: value };
    const updated = { ...formData, features: updatedFeatures };
    setFormData(updated);
    onChange(updated);
  };

  const addFeature = () => {
    const updatedFeatures = [...(formData.features || []), { title: '', description: '' }];
    const updated = { ...formData, features: updatedFeatures };
    setFormData(updated);
    onChange(updated);
  };

  const removeFeature = (index) => {
    const updatedFeatures = (formData.features || []).filter((_, i) => i !== index);
    const updated = { ...formData, features: updatedFeatures };
    setFormData(updated);
    onChange(updated);
  };

  return (
    <div className="editor-section">
      <h3>About Section Content</h3>
      
      <div className="editor-grid">
        <div className="about-images-grid">
          <ImageUpload
            section="about"
            field="image_1"
            currentImage={formData.image_1}
            onImageChange={(path, filename, uploadResult) => 
              handleImageChange('image_1', path, filename, uploadResult)
            }
            label="About Image 1"
            altText={formData.image_1_alt || ''}
            onAltTextChange={(value) => handleAltTextChange('image_1', value)}
            imageMapping={formData.image_mapping || {}}
          />

          <ImageUpload
            section="about"
            field="image_2"
            currentImage={formData.image_2}
            onImageChange={(path, filename, uploadResult) => 
              handleImageChange('image_2', path, filename, uploadResult)
            }
            label="About Image 2"
            altText={formData.image_2_alt || ''}
            onAltTextChange={(value) => handleAltTextChange('image_2', value)}
            imageMapping={formData.image_mapping || {}}
          />
        </div>

        <InputField
          label="Tag Text"
          value={formData.tag || ''}
          onChange={(val) => handleChange('tag', val)}
          placeholder="About Us"
        />

        <InputField
          label="Title"
          value={formData.title || ''}
          onChange={(val) => handleChange('title', val)}
          placeholder="Building Excellence Since 2010"
        />

        <TextAreaField
          label="Description"
          value={formData.description || ''}
          onChange={(val) => handleChange('description', val)}
          placeholder="BuildPort is a full-service construction company..."
          rows={4}
        />

        <div className="features-editor">
          <div className="features-header">
            <label>Features</label>
            <button type="button" onClick={addFeature} className="add-btn">
              <FaPlus /> Add Feature
            </button>
          </div>
          
          {(formData.features || []).map((feature, index) => (
            <div key={index} className="feature-item">
              <div className="feature-fields">
                <InputField
                  label="Feature Title"
                  value={feature.title || ''}
                  onChange={(val) => handleFeatureChange(index, 'title', val)}
                  placeholder="Quality Assurance"
                />
                <InputField
                  label="Feature Description"
                  value={feature.description || ''}
                  onChange={(val) => handleFeatureChange(index, 'description', val)}
                  placeholder="Rigorous quality control at every stage"
                />
              </div>
              <button 
                type="button" 
                onClick={() => removeFeature(index)}
                className="remove-btn"
              >
                <FaTrash />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutEditor;