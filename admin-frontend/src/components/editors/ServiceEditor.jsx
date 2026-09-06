// admin-frontend/src/components/editors/ServiceEditor.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import TextAreaField from '../common/TextAreaField';
import ImageUpload from '../common/ImageUpload';
import { FaTrash, FaPlus } from "react-icons/fa";

const ServiceEditor = ({ data, onChange }) => {
  const defaultData = {
    title: '',
    subtitle: '',
    services: [],
    background_image: null,
    background_image_alt: ''
  };

  const [formData, setFormData] = useState({ ...defaultData, ...data });

  useEffect(() => {
    if (data) {
      let servicesArray = [];
      
      if (data.services && Array.isArray(data.services)) {
        servicesArray = data.services;
      } else if (data.data && Array.isArray(data.data)) {
        servicesArray = data.data;
      } else if (Array.isArray(data)) {
        servicesArray = data;
      } else if (data.items && Array.isArray(data.items)) {
        servicesArray = data.items;
      }

      setFormData(prev => ({
        ...defaultData,
        ...data,
        services: servicesArray
      }));
    }
  }, [data]);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleImageChange = (path, filename, uploadResult) => {
    const updated = { 
      ...formData, 
      background_image: path,
      background_image_filename: filename,
      background_image_upload: uploadResult
    };
    setFormData(updated);
    onChange(updated);
  };

  const handleAltTextChange = (value) => {
    const updated = { ...formData, background_image_alt: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = { ...updatedServices[index], [field]: value };
    const updated = { ...formData, services: updatedServices };
    setFormData(updated);
    onChange(updated);
  };

  const addService = () => {
    const updatedServices = [...formData.services, { icon: 'fa-hard-hat', title: '', description: '' }];
    const updated = { ...formData, services: updatedServices };
    setFormData(updated);
    onChange(updated);
  };

  const removeService = (index) => {
    const currentServices = formData.services || [];
    const updatedServices = currentServices.filter((_, i) => i !== index);
    const updated = { ...formData, services: updatedServices };
    setFormData(updated);
    onChange(updated);
  };

  return (
    <div className="editor-section">
      <h3>Services Section Content</h3>
      
      <div className="editor-grid">
        <ImageUpload
          section="services"
          field="background_image"
          currentImage={formData.background_image}
          onImageChange={handleImageChange}
          label="Background Image"
          altText={formData.background_image_alt || ''}
          onAltTextChange={handleAltTextChange}
          imageMapping={formData.image_mapping || {}}
        />

        <InputField
          label="Section Title"
          value={formData.title}
          onChange={(val) => handleChange('title', val)}
          placeholder="Our Services"
        />

        <TextAreaField
          label="Section Subtitle"
          value={formData.subtitle}
          onChange={(val) => handleChange('subtitle', val)}
          placeholder="Comprehensive construction solutions..."
          rows={2}
        />

        <div className="services-editor">
          <div className="services-header">
            <label>Services List</label>
            <button type="button" onClick={addService} className="add-btn">
              <FaPlus /> Add Service
            </button>
          </div>
          
          {formData.services.map((service, index) => (
            <div key={index} className="service-item">
              <div className="service-fields">
                <InputField
                  label="Icon Class"
                  value={service.icon}
                  onChange={(val) => handleServiceChange(index, 'icon', val)}
                  placeholder="fa-hard-hat"
                />
                <InputField
                  label="Service Title"
                  value={service.title}
                  onChange={(val) => handleServiceChange(index, 'title', val)}
                  placeholder="General Contracting"
                />
                <TextAreaField
                  label="Description"
                  value={service.description}
                  onChange={(val) => handleServiceChange(index, 'description', val)}
                  placeholder="Full-service construction management..."
                  rows={2}
                />
              </div>
              <button 
                type="button" 
                onClick={() => removeService(index)}
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

export default ServiceEditor;