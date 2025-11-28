import React from 'react';

export default function StatsCard({ label, value, sub, trend, icon }) {
  return (
    <div className="stats-card">
      <div className="stats-header">
        <span className="stats-icon">{icon}</span>
        <span className="stats-label">{label}</span>
      </div>
      <div className="stats-value">{value}</div>
      {sub && <div className="stats-sub">{sub}</div>}
      {trend && (
        <div className={`stats-trend ${trend.type}`}>
          <span>{trend.icon}</span>
          <span>{trend.text}</span>
        </div>
      )}
    </div>
  );
}

