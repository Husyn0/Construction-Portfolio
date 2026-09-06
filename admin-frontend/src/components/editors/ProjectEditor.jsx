// admin-frontend/src/components/editors/ProjectEditor.jsx
import React, { useState, useEffect } from 'react';
import InputField from '../common/InputField';
import TextAreaField from '../common/TextAreaField';
import ImageUpload from '../common/ImageUpload';
import { FaTrash, FaPlus } from "react-icons/fa";

const ProjectEditor = ({ data, onChange }) => {
  const defaultData = {
    title: '',
    subtitle: '',
    projects: []
  };

  const [formData, setFormData] = useState({ ...defaultData, ...data });

  useEffect(() => {
    if (data) {
      // Ensure projects is always an array
      let projectsArray = [];
      
      // Check if data.projects exists and is an array
      if (data.projects && Array.isArray(data.projects)) {
        projectsArray = data.projects;
      } 
      // Check if data.data exists and is an array (API might return data in a 'data' field)
      else if (data.data && Array.isArray(data.data)) {
        projectsArray = data.data;
      }
      // Check if data itself is an array (API might return projects directly)
      else if (Array.isArray(data)) {
        projectsArray = data;
      }
      // Check if data has items property
      else if (data.items && Array.isArray(data.items)) {
        projectsArray = data.items;
      }
      
      setFormData(prev => ({
        ...defaultData,
        ...data,
        projects: projectsArray
      }));
    }
  }, [data]);

  const handleChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleProjectChange = (index, field, value) => {
    const updatedProjects = [...(formData.projects || [])];
    if (!updatedProjects[index]) {
      updatedProjects[index] = {};
    }
    updatedProjects[index] = { ...updatedProjects[index], [field]: value };
    const updated = { ...formData, projects: updatedProjects };
    setFormData(updated);
    onChange(updated);
  };

  const handleProjectImageChange = (index, path, filename, uploadResult) => {
    const updatedProjects = [...(formData.projects || [])];
    if (!updatedProjects[index]) {
      updatedProjects[index] = {};
    }
    updatedProjects[index] = { 
      ...updatedProjects[index], 
      project_image: path,
      project_image_filename: filename,
      project_image_upload: uploadResult
    };
    const updated = { ...formData, projects: updatedProjects };
    setFormData(updated);
    onChange(updated);
  };

  const handleProjectAltTextChange = (index, value) => {
    const updatedProjects = [...(formData.projects || [])];
    if (!updatedProjects[index]) {
      updatedProjects[index] = {};
    }
    updatedProjects[index] = { 
      ...updatedProjects[index], 
      project_image_alt: value 
    };
    const updated = { ...formData, projects: updatedProjects };
    setFormData(updated);
    onChange(updated);
  };

  const addTag = (projectIndex, tag) => {
    const updatedProjects = [...(formData.projects || [])];
    if (!updatedProjects[projectIndex]) {
      updatedProjects[projectIndex] = { tags: [] };
    }
    if (!updatedProjects[projectIndex].tags) {
      updatedProjects[projectIndex].tags = [];
    }
    updatedProjects[projectIndex].tags.push(tag);
    const updated = { ...formData, projects: updatedProjects };
    setFormData(updated);
    onChange(updated);
  };

  const removeTag = (projectIndex, tagIndex) => {
    const updatedProjects = [...(formData.projects || [])];
    if (updatedProjects[projectIndex] && updatedProjects[projectIndex].tags) {
      updatedProjects[projectIndex].tags = updatedProjects[projectIndex].tags.filter((_, i) => i !== tagIndex);
      const updated = { ...formData, projects: updatedProjects };
      setFormData(updated);
      onChange(updated);
    }
  };

  const addProject = () => {
    const updatedProjects = [...(formData.projects || []), { 
      title: '', 
      location: '', 
      category: '', 
      tags: [],
      project_image: null,
      project_image_alt: ''
    }];
    const updated = { ...formData, projects: updatedProjects };
    setFormData(updated);
    onChange(updated);
  };

  const removeProject = (index) => {
    const currentProjects = formData.projects || [];
    const updatedProjects = currentProjects.filter((_, i) => i !== index);
    const updated = { ...formData, projects: updatedProjects };
    setFormData(updated);
    onChange(updated);
  };

  const [newTag, setNewTag] = useState('');

  // If formData.projects is not an array, show a loading/error state
  if (!formData.projects || !Array.isArray(formData.projects)) {
    return (
      <div className="editor-section">
        <h3>Projects Section Content</h3>
        <div className="editor-error">
          <p>⚠️ Projects data is not available or in an invalid format.</p>
          <button 
            type="button" 
            onClick={() => {
              // Initialize with empty array
              setFormData(prev => ({ ...prev, projects: [] }));
            }}
            className="add-btn"
          >
            <FaPlus /> Initialize Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-section">
      <h3>Projects Section Content</h3>
      
      <div className="editor-grid">
        <InputField
          label="Section Title"
          value={formData.title || ''}
          onChange={(val) => handleChange('title', val)}
          placeholder="Featured Projects"
        />

        <TextAreaField
          label="Section Subtitle"
          value={formData.subtitle || ''}
          onChange={(val) => handleChange('subtitle', val)}
          placeholder="Explore our portfolio of exceptional construction projects..."
          rows={2}
        />

        <div className="projects-editor">
          <div className="projects-header">
            <label>Projects List ({formData.projects.length})</label>
            <button type="button" onClick={addProject} className="add-btn">
              <FaPlus /> Add Project
            </button>
          </div>
          
          {formData.projects.map((project, index) => (
            <div key={index} className="project-item">
              <div className="project-fields">
                <ImageUpload
                  section="projects"
                  field={`project_image_${index}`}
                  currentImage={project.project_image}
                  onImageChange={(path, filename, uploadResult) => 
                    handleProjectImageChange(index, path, filename, uploadResult)
                  }
                  label="Project Image"
                  altText={project.project_image_alt || ''}
                  onAltTextChange={(value) => handleProjectAltTextChange(index, value)}
                  imageMapping={project.image_mapping || {}}
                />

                <InputField
                  label="Project Title"
                  value={project.title || ''}
                  onChange={(val) => handleProjectChange(index, 'title', val)}
                  placeholder="Riverside Tower"
                />
                <InputField
                  label="Location"
                  value={project.location || ''}
                  onChange={(val) => handleProjectChange(index, 'location', val)}
                  placeholder="Austin, TX"
                />
                <InputField
                  label="Category"
                  value={project.category || ''}
                  onChange={(val) => handleProjectChange(index, 'category', val)}
                  placeholder="Commercial"
                />
                
                <div className="tags-editor">
                  <label>Tags</label>
                  <div className="tags-input">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add tag..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newTag.trim()) {
                          addTag(index, newTag.trim());
                          setNewTag('');
                        }
                      }}
                    />
                    <button 
                      type="button"
                      onClick={() => {
                        if (newTag.trim()) {
                          addTag(index, newTag.trim());
                          setNewTag('');
                        }
                      }}
                      className="add-tag-btn"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div className="tags-list">
                    {project.tags && project.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="tag-item">
                        {tag}
                        <button onClick={() => removeTag(index, tagIndex)}>
                          <FaTrash />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => removeProject(index)}
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

export default ProjectEditor;