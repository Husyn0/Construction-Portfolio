// admin-frontend/src/components/editors/HeroEditor.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import TextAreaField from '../common/TextAreaField';
import StatEditor from '../common/StateEditor';
import ImageUpload from '../common/ImageUpload';

const HeroEditor = ({ data, onChange }) => {
  const defaultData = {
    badge: '',
    title: '',
    description: '',
    stats: [],
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
        stats: data.stats || []
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

  const handleStatChange = (index, field, value) => {
    const updatedStats = [...(formData.stats || [])];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    const updated = { ...formData, stats: updatedStats };
    setFormData(updated);
    onChange(updated);
  };

  const addStat = () => {
    const updatedStats = [...(formData.stats || []), { number: '', label: '' }];
    const updated = { ...formData, stats: updatedStats };
    setFormData(updated);
    onChange(updated);
  };

  const removeStat = (index) => {
    const updatedStats = (formData.stats || []).filter((_, i) => i !== index);
    const updated = { ...formData, stats: updatedStats };
    setFormData(updated);
    onChange(updated);
  };

  return (
    <div className="editor-section">
      <h3>Hero Section Content</h3>
      
      <div className="editor-grid">
        <div className="hero-images-grid">
          <ImageUpload
            section="hero"
            field="image_1"
            currentImage={formData.image_1}
            onImageChange={(path, filename, uploadResult) => 
              handleImageChange('image_1', path, filename, uploadResult)
            }
            label="Hero Image 1 (Main)"
            altText={formData.image_1_alt || ''}
            onAltTextChange={(value) => handleAltTextChange('image_1', value)}
            imageMapping={formData.image_mapping || {}}
          />

          <ImageUpload
            section="hero"
            field="image_2"
            currentImage={formData.image_2}
            onImageChange={(path, filename, uploadResult) => 
              handleImageChange('image_2', path, filename, uploadResult)
            }
            label="Hero Image 2 (Secondary)"
            altText={formData.image_2_alt || ''}
            onAltTextChange={(value) => handleAltTextChange('image_2', value)}
            imageMapping={formData.image_mapping || {}}
          />
        </div>

        <InputField
          label="Badge Text"
          value={formData.badge || ''}
          onChange={(val) => handleChange('badge', val)}
          placeholder="2026 Award Winner"
        />

        <TextAreaField
          label="Title"
          value={formData.title || ''}
          onChange={(val) => handleChange('title', val)}
          placeholder="Built with precision & integrity"
          rows={2}
        />

        <TextAreaField
          label="Description"
          value={formData.description || ''}
          onChange={(val) => handleChange('description', val)}
          placeholder="From concept to completion..."
          rows={3}
        />

        <div className="stats-editor">
          <div className="stats-header">
            <label>Statistics</label>
            <button type="button" onClick={addStat} className="add-btn">
              <i className="fas fa-plus"></i> Add Stat
            </button>
          </div>
          
          {(formData.stats || []).map((stat, index) => (
            <StatEditor
              key={index}
              index={index}
              stat={stat}
              onChange={handleStatChange}
              onRemove={() => removeStat(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroEditor;