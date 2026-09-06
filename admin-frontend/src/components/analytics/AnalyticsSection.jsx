// admin-frontend/src/components/analytics/AnalyticsSection.jsx
import React from 'react';
import AnalyticsCard from './AnalyticsCard';
import TrafficSourcesChart from './TrafficSourcesChart';
import DeviceBreakdownChart from './DeviceBreakdownChart';
import GeolocationChart from './GeolocationChart';
import UniqueVsReturningChart from './UniqueVsReturningChart';

const AnalyticsSection = ({ analytics, loading }) => {
  const analyticsCards = [
    {
      title: 'Total Visits',
      value: analytics.overview?.total_visits || 0,
      icon: 'fa-chart-line',
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      title: 'Unique Visitors',
      value: analytics.overview?.unique_visitors || 0,
      icon: 'fa-user-check',
      color: '#10b981',
      bgColor: '#d1fae5'
    },
    {
      title: 'Returning Visitors',
      value: analytics.overview?.returning_visitors || 0,
      icon: 'fa-user-friends',
      color: '#8b5cf6',
      bgColor: '#ede9fe'
    },
    {
      title: 'Returning Rate',
      value: `${analytics.uniqueVsReturning?.returning_percentage || 0}%`,
      icon: 'fa-percentage',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    }
  ];

  return (
    <div className="analytics-section">
      <div className="analytics-section-header">
        <h3 className="section-title">
          <i className="fas fa-chart-area"></i>
          Portfolio Analytics
          {loading && <span className="loading-badge">Loading...</span>}
        </h3>
        <span className="analytics-period">Last 30 days</span>
      </div>
      
      <div className="analytics-grid">
        {analyticsCards.map((stat, index) => (
          <AnalyticsCard 
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            bgColor={stat.bgColor}
            loading={loading}
          />
        ))}
      </div>

      <div className="analytics-charts-grid">
        <div className="analytics-chart-card">
          <div className="chart-card-header">
            <h4><i className="fas fa-tachometer-alt"></i> Traffic Sources</h4>
          </div>
          <TrafficSourcesChart 
            sources={analytics.trafficSources} 
            loading={loading} 
          />
        </div>

        <div className="analytics-chart-card">
          <div className="chart-card-header">
            <h4><i className="fas fa-mobile-alt"></i> Device Types</h4>
          </div>
          <DeviceBreakdownChart 
            devices={analytics.deviceBreakdown?.devices} 
            loading={loading} 
          />
        </div>
      </div>

      <div className="analytics-charts-grid-full">
        <div className="analytics-chart-card">
          <div className="chart-card-header">
            <h4><i className="fas fa-globe"></i> Visitor Locations</h4>
          </div>
          <GeolocationChart 
            locations={analytics.geolocation} 
            loading={loading} 
          />
        </div>

        <div className="analytics-chart-card">
          <div className="chart-card-header">
            <h4><i className="fas fa-users"></i> Visitor Breakdown</h4>
          </div>
          <UniqueVsReturningChart 
            data={analytics.uniqueVsReturning} 
            loading={loading} 
          />
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;