// admin-frontend/src/components/analytics/TrafficSourcesChart.jsx
import React from 'react';

const TrafficSourcesChart = ({ sources, loading }) => {
  if (loading) {
    return (
      <div className="chart-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading traffic data...</p>
      </div>
    );
  }

  if (!sources || sources.length === 0) {
    return (
      <div className="chart-empty">
        <i className="fas fa-chart-pie"></i>
        <p>No traffic data available</p>
      </div>
    );
  }

  const maxVisits = Math.max(...sources.map(s => s.visits));

  // Get top 7 sources
  const topSources = sources.slice(0, 7);

  return (
    <div className="traffic-sources-chart">
      {topSources.map((source, idx) => {
        const percentage = maxVisits > 0 ? (source.visits / maxVisits) * 100 : 0;
        return (
          <div key={idx} className="traffic-item">
            <div className="traffic-item-header">
              <span className="source-name">{source.source}</span>
              <span className="source-count">{source.visits.toLocaleString()}</span>
            </div>
            <div className="traffic-bar">
              <div 
                className="traffic-bar-fill" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TrafficSourcesChart;