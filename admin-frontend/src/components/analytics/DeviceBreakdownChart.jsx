// admin-frontend/src/components/analytics/DeviceBreakdownChart.jsx
import React from 'react';

const DeviceBreakdownChart = ({ devices, loading }) => {
  if (loading) {
    return (
      <div className="chart-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading device data...</p>
      </div>
    );
  }

  if (!devices || devices.length === 0) {
    return (
      <div className="chart-empty">
        <i className="fas fa-mobile-alt"></i>
        <p>No device data available</p>
      </div>
    );
  }

  const totalVisits = devices.reduce((sum, d) => sum + d.visits, 0);

  const getDeviceIcon = (type) => {
    switch(type?.toLowerCase()) {
      case 'mobile': return 'fa-mobile-alt';
      case 'tablet': return 'fa-tablet-alt';
      case 'desktop': return 'fa-desktop';
      default: return 'fa-device';
    }
  };

  const getDeviceColor = (type) => {
    switch(type?.toLowerCase()) {
      case 'mobile': return '#3b82f6';
      case 'tablet': return '#8b5cf6';
      case 'desktop': return '#10b981';
      default: return '#6b7280';
    }
  };

  return (
    <div className="device-breakdown-chart">
      {devices.map((device, idx) => {
        const percentage = totalVisits > 0 ? (device.visits / totalVisits) * 100 : 0;
        return (
          <div key={idx} className="device-item">
            <div className="device-item-header">
              <span className="device-icon" style={{ color: getDeviceColor(device.type) }}>
                <i className={`fas ${getDeviceIcon(device.type)}`}></i>
              </span>
              <span className="device-name">{device.type || 'Other'}</span>
              <span className="device-percentage">{percentage.toFixed(0)}%</span>
            </div>
            <div className="device-bar">
              <div 
                className="device-bar-fill" 
                style={{ 
                  width: `${percentage}%`,
                  background: getDeviceColor(device.type)
                }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DeviceBreakdownChart;