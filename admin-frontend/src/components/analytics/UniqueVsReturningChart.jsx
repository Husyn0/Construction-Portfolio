// admin-frontend/src/components/analytics/UniqueVsReturningChart.jsx
import React from 'react';

const UniqueVsReturningChart = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="chart-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading visitor data...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="chart-empty">
        <i className="fas fa-users"></i>
        <p>No visitor data available</p>
      </div>
    );
  }

  const total = data.unique_visitors + data.returning_visitors;
  const uniquePercentage = total > 0 ? (data.unique_visitors / total) * 100 : 0;
  const returningPercentage = total > 0 ? (data.returning_visitors / total) * 100 : 0;

  return (
    <div className="unique-returning-chart">
      <div className="visitor-stats">
        <div className="visitor-stat-item">
          <span className="stat-label">Unique Visitors</span>
          <span className="stat-value">{data.unique_visitors?.toLocaleString()}</span>
          <span className="stat-percentage">{uniquePercentage.toFixed(0)}%</span>
        </div>
        <div className="visitor-stat-item">
          <span className="stat-label">Returning Visitors</span>
          <span className="stat-value">{data.returning_visitors?.toLocaleString()}</span>
          <span className="stat-percentage">{returningPercentage.toFixed(0)}%</span>
        </div>
        <div className="visitor-stat-item highlight">
          <span className="stat-label">Returning Rate</span>
          <span className="stat-value">{data.returning_percentage?.toFixed(0)}%</span>
        </div>
      </div>
      <div className="visitor-bar-container">
        <div className="visitor-bar">
          <div 
            className="visitor-bar-unique" 
            style={{ width: `${uniquePercentage}%` }}
          >
            <span>Unique</span>
          </div>
          <div 
            className="visitor-bar-returning" 
            style={{ width: `${returningPercentage}%` }}
          >
            <span>Returning</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UniqueVsReturningChart;