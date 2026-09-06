// admin-frontend/src/components/analytics/GeolocationChart.jsx
import React from 'react';

const GeolocationChart = ({ locations, loading }) => {
  if (loading) {
    return (
      <div className="chart-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading location data...</p>
      </div>
    );
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="chart-empty">
        <i className="fas fa-globe"></i>
        <p>No location data available</p>
      </div>
    );
  }

  const topLocations = locations.slice(0, 10);
  const maxVisits = Math.max(...topLocations.map(l => l.visits));

  return (
    <div className="geolocation-chart">
      {topLocations.map((location, idx) => {
        const percentage = maxVisits > 0 ? (location.visits / maxVisits) * 100 : 0;
        return (
          <div key={idx} className="geo-item">
            <span className="geo-rank">#{idx + 1}</span>
            <span className="geo-flag">
              <i className="fas fa-map-marker-alt" style={{ color: '#f59e0b' }}></i>
            </span>
            <span className="geo-name">{location.country}</span>
            <div className="geo-bar">
              <div 
                className="geo-bar-fill" 
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <span className="geo-count">{location.visits.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
};

export default GeolocationChart;