import React from 'react';

export default function Badge({ children, variant = 'neutral', size = 'md', className = '' }) {
  return (
    <span className={`badge badge-${variant} badge-${size} ${className}`}>
      {children}
    </span>
  );
}
