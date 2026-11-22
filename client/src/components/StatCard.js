import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  badgeText,
  badgeVariant = 'neutral',
  accentColor = 'blue'
}) {
  return (
    <div className={`stat-card accent-${accentColor}`}>
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        {icon && <div className={`stat-icon-wrapper text-${accentColor}`}>{icon}</div>}
      </div>
      <div className="stat-card-body">
        <div className="stat-value-row">
          <span className="stat-value">{value}</span>
          {badgeText && (
            <span className={`badge badge-${badgeVariant} badge-sm`}>
              {badgeText}
            </span>
          )}
        </div>
        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
      </div>
    </div>
  );
}
