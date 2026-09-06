// admin-frontend/src/pages/ContentManager.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ContentEditor from '../components/ContentEditor';
import { fetchContent, saveContent } from '../api/contentApi';
import { GoArrowLeft, GoSync } from "react-icons/go";
import { FaRegSave } from "react-icons/fa";

const ContentManager = ({ onLogout, onBack }) => {
  const [activeSection, setActiveSection] = useState('hero');
  const [content, setContent] = useState({});
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Get default content for each section
  const getDefaultContent = useCallback((section) => {
    const defaults = {
      hero: {
        badge: '2026 Award Winner',
        title: 'Built with precision & integrity',
        description: 'From concept to completion — we deliver commercial, residential, and industrial projects that stand the test of time.',
        stats: [
          { number: '120+', label: 'Projects Completed' },
          { number: '98%', label: 'Client Satisfaction' },
          { number: '15+', label: 'Years Experience' }
        ]
      },
      about: {
        tag: 'About Us',
        title: 'Building Excellence Since 2010',
        description: 'BuildPort is a full-service construction company dedicated to delivering superior quality, innovation, and reliability.',
        features: [
          { title: 'Quality Assurance', description: 'Rigorous quality control at every stage' },
          { title: 'On-Time Delivery', description: 'Projects completed within schedule' },
          { title: 'Sustainable Building', description: 'Eco-friendly materials and practices' }
        ]
      },
      services: {
        title: 'Our Services',
        subtitle: 'Comprehensive construction solutions tailored to your project needs',
        services: [
          { icon: 'fa-hard-hat', title: 'General Contracting', description: 'Full-service construction management from ground-up to completion.' },
          { icon: 'fa-pencil-ruler', title: 'Design & Build', description: 'Integrated design and construction services for seamless delivery.' },
          { icon: 'fa-house-chimney', title: 'Residential Construction', description: 'Custom homes, renovations, and residential development projects.' }
        ]
      },
      team: {
        title: 'Our Team',
        subtitle: 'Meet the experts behind our award-winning projects',
        members: [
          { name: 'David Martinez', role: 'CEO & Founder', experience: '25+ years' },
          { name: 'Sarah Johnson', role: 'Project Director', experience: '18 years' },
          { name: 'Michael Chen', role: 'Lead Architect', experience: '15 years' }
        ]
      },
      projects: {
        title: 'Featured Projects',
        subtitle: 'Explore our portfolio of exceptional construction projects',
        projects: [
          { title: 'Riverside Tower', location: 'Austin, TX', category: 'Commercial', tags: ['High-rise', 'LEED Certified'] },
          { title: 'Willow Creek Estate', location: 'Napa Valley, CA', category: 'Residential', tags: ['Luxury', 'Eco-Friendly'] }
        ]
      },
      contact: {
        title: "Let's Build Together",
        description: 'Have a project in mind? Get in touch with our team for a free consultation and quote.',
        phone: '+1 (555) 123-4567',
        email: 'info@buildport.com',
        address: '123 Construction Ave, Suite 200'
      }
    };
    return defaults[section] || {};
  }, []);

  // Load content for the active section
  const loadContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSaveMessage('');
    
    try {
      const data = await fetchContent(activeSection);
      
      // Validate the data structure
      if (data && typeof data === 'object') {
        // Ensure arrays exist for sections that need them
        const validatedData = { ...data };
        
        // For sections that require arrays, ensure they exist
        if (['services', 'projects', 'team'].includes(activeSection)) {
          const arrayField = activeSection === 'team' ? 'members' : activeSection;
          if (!validatedData[arrayField] || !Array.isArray(validatedData[arrayField])) {
            const defaultData = getDefaultContent(activeSection);
            validatedData[arrayField] = defaultData[arrayField] || [];
          }
        }
        
        setContent(prev => ({
          ...prev,
          [activeSection]: validatedData
        }));
        setHasUnsavedChanges(false);
      } else {
        throw new Error('Invalid data structure received from API');
      }
    } catch (error) {
      console.error('Error loading content:', error);
      
      // Use default content as fallback
      const defaultData = getDefaultContent(activeSection);
      setContent(prev => ({
        ...prev,
        [activeSection]: defaultData
      }));
      
      const errorMessage = error.message || 'Unknown error';
      setError(`⚠️ Using default content - ${errorMessage}`);
      setSaveMessage('⚠️ Using default content - API connection issue');
      
      // Clear the error message after 5 seconds
      setTimeout(() => {
        setSaveMessage('');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  }, [activeSection, getDefaultContent]);

  // Load content when section changes
  useEffect(() => {
    loadContent();
  }, [loadContent]);

  // Handle content changes from editor
  const handleContentChange = useCallback((section, data) => {
    if (!data || typeof data !== 'object') {
      console.warn('Invalid data received in handleContentChange');
      return;
    }

    setContent(prev => ({
      ...prev,
      [section]: data
    }));
    setHasUnsavedChanges(true);
    setError(null);
    
    // Clear any existing save message
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setSaveMessage('');
  }, []);

  // Save content
  const handleSave = async () => {
    if (!content[activeSection]) {
      setSaveMessage('❌ No content to save');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    setLoading(true);
    setSaveMessage('');
    setError(null);

    try {
      const currentData = content[activeSection];
      
      // Validate data before saving
      if (typeof currentData !== 'object' || currentData === null) {
        throw new Error('Invalid data structure');
      }

      // For array-based sections, ensure the array exists
      if (['services', 'projects', 'team'].includes(activeSection)) {
        const arrayField = activeSection === 'team' ? 'members' : activeSection;
        if (!currentData[arrayField] || !Array.isArray(currentData[arrayField])) {
          throw new Error(`Invalid ${arrayField} data: must be an array`);
        }
      }

      await saveContent(activeSection, currentData);
      setHasUnsavedChanges(false);
      setSaveMessage('✅ Content saved successfully!');
      
      // Clear success message after 3 seconds
      saveTimeoutRef.current = setTimeout(() => {
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Save error:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      setError(`❌ Error saving ${activeSection}: ${errorMessage}`);
      setSaveMessage(`❌ Error saving content: ${errorMessage}`);
      
      // Clear error message after 5 seconds
      saveTimeoutRef.current = setTimeout(() => {
        setSaveMessage('');
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handle section change
  const handleSectionChange = useCallback((sectionId) => {
    // Check for unsaved changes before switching
    if (hasUnsavedChanges) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to switch sections without saving?')) {
        return;
      }
    }
    setActiveSection(sectionId);
    setError(null);
    setSaveMessage('');
  }, [hasUnsavedChanges]);

  // Handle keyboard shortcuts (Ctrl+S to save)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Retry loading content
  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
    loadContent();
  }, [loadContent]);

  const sections = [
    { id: 'hero', label: 'Hero Section', icon: 'fa-star' },
    { id: 'about', label: 'About Section', icon: 'fa-info-circle' },
    { id: 'services', label: 'Services', icon: 'fa-wrench' },
    { id: 'projects', label: 'Projects', icon: 'fa-tasks' },
    { id: 'team', label: 'Team', icon: 'fa-users' },
    { id: 'contact', label: 'Contact', icon: 'fa-envelope' }
  ];

  const currentSection = sections.find(s => s.id === activeSection);

  return (
    <div className="admin-dashboard">
      <Sidebar 
        sections={sections} 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        onLogout={onLogout}
      />
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-left">
            <button className="back-btn" onClick={onBack}>
              <GoArrowLeft size={18} />
              Back to Dashboard
            </button>
            <h2>
              <i className={`fas ${currentSection?.icon}`}></i>
              Edit {currentSection?.label}
            </h2>
            {hasUnsavedChanges && (
              <span className="unsaved-indicator">● Unsaved changes</span>
            )}
          </div>
          <div className="header-actions">
            {saveMessage && (
              <span className={`save-message ${saveMessage.includes('✅') ? 'success' : saveMessage.includes('⚠️') ? 'warning' : 'error'}`}>
                {saveMessage}
              </span>
            )}
            <button 
              className="save-btn" 
              onClick={handleSave}
              disabled={loading || isLoading}
            >
              {loading ? (
                <>
                  <GoSync className="spinning" size={18} />
                  Saving...
                </>
              ) : (
                <>
                  <FaRegSave size={18} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            {error.includes('API connection') && (
              <button onClick={handleRetry} className="retry-btn">
                <GoSync size={14} /> Retry
              </button>
            )}
          </div>
        )}

        <div className="editor-container">
          {isLoading ? (
            <div className="loading-spinner">
              <GoSync className="spinning" size={32} />
              <p>Loading content...</p>
            </div>
          ) : (
            <ContentEditor 
              section={activeSection}
              content={content[activeSection] || getDefaultContent(activeSection)}
              onContentChange={handleContentChange}
            />
          )}
        </div>

        {/* Quick info bar */}
        <div className="editor-footer">
          <div className="editor-info">
            <span className="section-info">
              Editing: <strong>{currentSection?.label}</strong>
            </span>
            {hasUnsavedChanges && (
              <span className="unsaved-status">⚠️ Unsaved changes</span>
            )}
            <span className="keyboard-hint">
              Press <kbd>Ctrl+S</kbd> to save
            </span>
          </div>
          <div className="editor-stats">
            <span className="char-count">
              {content[activeSection] ? 
                `${JSON.stringify(content[activeSection]).length} characters` : 
                'No content'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManager;