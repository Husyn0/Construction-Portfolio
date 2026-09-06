// admin-frontend/src/components/analytics/AnalyticsCard.jsx
import React from 'react';

const AnalyticsCard = ({ title, value, icon, color, bgColor, loading }) => {
  return (
    <div className="analytics-card">
      <div className="analytics-card-icon" style={{ background: bgColor, color: color }}>
        <i className={`fas ${icon}`}></i>
      </div>
      <div className="analytics-card-info">
        <h3>{loading ? '...' : value}</h3>
        <p>{title}</p>
      </div>
    </div>
  );
};

export default AnalyticsCard;