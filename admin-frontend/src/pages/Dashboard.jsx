// admin-frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  GoSignOut, 
  GoHome, 
  GoGear, 
  GoTasklist, 
  GoPeople, 
  GoTools,
  GoX,
  GoArrowRight
} from "react-icons/go";
import { FaBars } from "react-icons/fa";
import { fetchAnalyticsData } from '../api/analyticsApi';
import AnalyticsSection from '../components/analytics/AnalyticsSection';

const Dashboard = ({ onLogout, onNavigateToContentManager }) => {
  const [stats, setStats] = useState({
    projects: 0,
    team: 0,
    services: 0,
    totalContent: 0
  });
  const [analytics, setAnalytics] = useState({
    overview: null,
    trafficSources: [],
    geolocation: [],
    deviceBreakdown: null,
    uniqueVsReturning: null
  });
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setStats({
          projects: 12,
          team: 8,
          services: 6,
          totalContent: 4
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const data = await fetchAnalyticsData();
        setAnalytics(data);
      } catch (error) {
        console.error('Error loading analytics:', error);
        setAnalytics({
          overview: { total_visits: 0, unique_visitors: 0, returning_visitors: 0, time_range: 'Last 30 days' },
          trafficSources: [],
          geolocation: [],
          deviceBreakdown: { devices: [], browsers: [], os: [] },
          uniqueVsReturning: { unique_visitors: 0, returning_visitors: 0, new_visitors: 0, returning_percentage: 0 }
        });
      } finally {
        setAnalyticsLoading(false);
      }
    };
    loadAnalytics();
  }, []);

  const toggleSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeSidebar = () => {
    setIsMobileOpen(false);
  };

  const statCards = [
    {
      title: 'Total Content Sections',
      value: stats.totalContent,
      icon: 'fa-layer-group',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      title: 'Projects',
      value: stats.projects,
      icon: 'fa-tasks',
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      title: 'Team Members',
      value: stats.team,
      icon: 'fa-users',
      color: '#8b5cf6',
      bgColor: '#ede9fe'
    },
    {
      title: 'Services',
      value: stats.services,
      icon: 'fa-wrench',
      color: '#10b981',
      bgColor: '#d1fae5'
    }
  ];

  return (
    <div className="admin-dashboard-wrapper">
      {/* Sidebar Controller */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isMobileOpen ? <GoX size={24} /> : <FaBars size={24} />}
      </button>

      {isMobileOpen && <div className="sidebar-overlay" onClick={closeSidebar}></div>}

      {/* Sidebar */}
      <div className={`dashboard-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <i className="fas fa-hard-hat"></i>
            <span>BuildPort</span>
          </div>
          <p className="sidebar-subtitle">Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          <button className="sidebar-item active">
            <GoHome size={20} />
            <span>Dashboard</span>
          </button>
          <button className="sidebar-item" onClick={() => {
            onNavigateToContentManager();
            closeSidebar();
          }}>
            <GoGear size={20} />
            <span>Content Manager</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-item logout" onClick={onLogout}>
            <GoSignOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="dashboard-main">
        {/* Topbar */}
        <div className="dashboard-topbar">
          <h2>
            <i className="fas fa-chart-pie"></i>
            Dashboard Overview
          </h2>
          <button className="dashboard-primary-btn" onClick={onNavigateToContentManager}>
            <GoGear size={18} />
            Manage Content
          </button>
        </div>

        {/* Content Stats */}
        <div className="stats-grid">
          {statCards.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon" style={{ background: stat.bgColor, color: stat.color }}>
                <i className={`fas ${stat.icon}`}></i>
              </div>
              <div className="stat-info">
                <h3>{loading ? '...' : stat.value}</h3>
                <p>{stat.title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics Section - Reusable Component */}
        <AnalyticsSection 
          analytics={analytics} 
          loading={analyticsLoading} 
        />

        {/* Quick Actions */}
        <div className="dashboard-actions">
          <div className="action-card" onClick={onNavigateToContentManager}>
            <GoGear size={36} />
            <h4>Content Management</h4>
            <p>Edit hero, about, services & contact sections</p>
            <button className="action-btn">
              Go to Editor <GoArrowRight />
            </button>
          </div>
          <div className="action-card" onClick={onNavigateToContentManager}>
            <GoTasklist size={36} />
            <h4>Projects</h4>
            <p>Manage your project portfolio</p>
            <button className="action-btn">
              Manage <GoArrowRight />
            </button>
          </div>
          <div className="action-card" onClick={onNavigateToContentManager}>
            <GoPeople size={36} />
            <h4>Team</h4>
            <p>Manage team members</p>
            <button className="action-btn">
              Manage <GoArrowRight />
            </button>
          </div>
          <div className="action-card" onClick={onNavigateToContentManager}>
            <GoTools size={36} />
            <h4>Services</h4>
            <p>Manage service offerings</p>
            <button className="action-btn">
              Manage <GoArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;