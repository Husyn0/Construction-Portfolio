import React, { useState } from 'react';
import {
  FiGrid,
  FiInfo,
  FiLayers,
  FiLogOut,
  FiMail,
  FiMenu,
  FiSettings,
  FiStar,
  FiTool,
  FiUsers,
  FiX
} from 'react-icons/fi';

const sectionIcons = {
  about: FiInfo,
  contact: FiMail,
  dashboard: FiGrid,
  hero: FiStar,
  content: FiLayers,
  projects: FiLayers,
  services: FiTool,
  team: FiUsers
};

const Sidebar = ({
  sections = [],
  activeSection,
  onSectionChange,
  onDashboard,
  onLogout,
  sectionLabel = 'WEBSITE CONTENT'
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const closeSidebar = () => setIsMobileOpen(false);

  const selectSection = (sectionId) => {
    onSectionChange(sectionId);
    closeSidebar();
  };

  return (
    <>
      <button
        className="sidebar-toggle"
        type="button"
        aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMobileOpen}
        onClick={() => setIsMobileOpen((isOpen) => !isOpen)}
      >
        {isMobileOpen ? <FiX size={21} /> : <FiMenu size={21} />}
      </button>

      {isMobileOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Close navigation menu"
          onClick={closeSidebar}
        />
      )}

      <aside className={`admin-sidebar${isMobileOpen ? ' mobile-open' : ''}`}>
        <a className="sidebar-brand" href="/" aria-label="BuildPort Studio home">
          <span className="sidebar-brand-icon"><FiLayers aria-hidden="true" /></span>
          <span className="sidebar-brand-name">BUILDPORT<span>/</span>STUDIO</span>
        </a>

        <div className="sidebar-workspace">
          <span className="workspace-indicator" aria-hidden="true" />
          <div>
            <span className="workspace-title">Admin workspace</span>
            <span className="workspace-caption">Portfolio management</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Admin navigation">
          <span className="sidebar-section-label">WORKSPACE</span>
          <button
            type="button"
            className={`sidebar-item${activeSection === 'dashboard' ? ' active' : ''}`}
            aria-current={activeSection === 'dashboard' ? 'page' : undefined}
            onClick={() => {
              if (onDashboard) onDashboard();
              closeSidebar();
            }}
          >
            <FiGrid aria-hidden="true" />
            <span>Dashboard</span>
          </button>

          {sections.length > 0 && (
            <>
              <span className="sidebar-section-label">{sectionLabel}</span>
              {sections.map((section) => {
                const Icon = sectionIcons[section.id] || FiSettings;
                const isActive = activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    className={`sidebar-item${isActive ? ' active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => selectSection(section.id)}
                  >
                    <Icon aria-hidden="true" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item logout" type="button" onClick={onLogout}>
            <FiLogOut aria-hidden="true" />
            <span>Sign out</span>
          </button>
          <span className="sidebar-footer-note">BUILT TO LAST</span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
