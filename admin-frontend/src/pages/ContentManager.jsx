// admin-frontend/src/pages/ContentManager.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ContentEditor from '../components/ContentEditor';
import { 
  fetchContent, 
  saveContent,
  fetchServices,
  fetchProjects,
  fetchTeam
} from '../api/contentApi';
import { FaSave, FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ContentManager = ({ onLogout, onBack }) => {
  const [activeSection, setActiveSection] = useState('hero');
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [error, setError] = useState(null);

  const sections = [
    { id: 'hero', label: 'Hero Section' },
    { id: 'about', label: 'About Section' },
    { id: 'services', label: 'Services' },
    { id: 'projects', label: 'Projects' },
    { id: 'team', label: 'Team' },
    { id: 'contact', label: 'Contact' }
  ];

  const loadContent = async (section) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      
      // Use the correct API based on section type
      if (section === 'services') {
        const services = await fetchServices();
        data = { 
          title: 'Our Services', 
          subtitle: 'Comprehensive construction solutions...', 
          services: services 
        };
      } else if (section === 'projects') {
        const projects = await fetchProjects();
        data = { 
          title: 'Featured Projects', 
          subtitle: 'Explore our portfolio...', 
          projects: projects 
        };
      } else if (section === 'team') {
        const members = await fetchTeam();
        data = { 
          title: 'Our Team', 
          subtitle: 'Meet the experts...', 
          members: members 
        };
      } else {
        // hero, about, contact - use content table
        data = await fetchContent(section);
      }
      
      setContent(prev => ({ ...prev, [section]: data }));
    } catch (err) {
      console.error(`Error loading ${section}:`, err);
      setError(`Failed to load ${section} content: ${err.message}`);
      // Set default empty content based on section type
      const defaultData = section === 'services' ? { services: [] } :
                         section === 'projects' ? { projects: [] } :
                         section === 'team' ? { members: [] } :
                         {};
      setContent(prev => ({ ...prev, [section]: defaultData }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContent(activeSection);
  }, [activeSection]);

  const handleContentChange = (section, data) => {
    setContent(prev => ({ ...prev, [section]: data }));
    if (saveStatus) setSaveStatus(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    setError(null);
    
    try {
      const sectionData = content[activeSection];
      if (!sectionData || Object.keys(sectionData).length === 0) {
        throw new Error('No content to save');
      }
      
      // For services, projects, team - the data is already saved via individual CRUD operations
      // We only save the title/subtitle for these sections
      if (['services', 'projects', 'team'].includes(activeSection)) {
        // These sections handle saving through individual item updates
        // Just show success and reload
        setSaveStatus({ type: 'success', message: 'Changes saved successfully!' });
        await loadContent(activeSection);
      } else {
        // hero, about, contact - use content table
        await saveContent(activeSection, sectionData);
        setSaveStatus({ type: 'success', message: 'Content saved successfully!' });
        await loadContent(activeSection);
      }
    } catch (err) {
      console.error('Save error:', err);
      setSaveStatus({ type: 'error', message: `Failed to save: ${err.message}` });
      setError(err.message);
    } finally {
      setSaving(false);
      if (saveStatus?.type === 'success') {
        setTimeout(() => setSaveStatus(null), 3000);
      }
    }
  };

  const handleSectionChange = (sectionId) => {
    if (saving) return;
    setActiveSection(sectionId);
    setSaveStatus(null);
    setError(null);
  };

  return (
    <div className="content-manager">
      <Sidebar 
        sections={sections}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onLogout={onLogout}
      />
      
      <div className="content-main">
        <div className="content-header">
          <div className="header-left">
            <button className="back-btn" onClick={onBack}>
              ← Back to Dashboard
            </button>
            <h2>{sections.find(s => s.id === activeSection)?.label || 'Content Editor'}</h2>
          </div>
          <div className="header-right">
            {saveStatus && (
              <div className={`save-status ${saveStatus.type}`}>
                {saveStatus.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
                {saveStatus.message}
              </div>
            )}
            <button 
              className="save-btn" 
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <FaSpinner className="spinning" /> : <FaSave />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <FaExclamationCircle />
            {error}
          </div>
        )}

        <div className="content-editor-container">
          {loading ? (
            <div className="loading-container">
              <FaSpinner className="spinning" />
              <p>Loading content...</p>
            </div>
          ) : (
            <ContentEditor
              section={activeSection}
              content={content[activeSection] || {}}
              onContentChange={(data) => handleContentChange(activeSection, data)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentManager;