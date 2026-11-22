import React from 'react';
import { CheckCircleIcon, AlertTriangleIcon, AlertCircleIcon, CloseIcon } from './Icons.js';

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => {
        let Icon = CheckCircleIcon;
        if (t.type === 'error' || t.type === 'danger') Icon = AlertCircleIcon;
        if (t.type === 'warning') Icon = AlertTriangleIcon;

        return (
          <div key={t.id} className={`toast toast-${t.type || 'info'}`}>
            <div className="toast-icon">
              <Icon size={16} />
            </div>
            <div className="toast-content">
              {t.title && <div className="toast-title">{t.title}</div>}
              <div className="toast-message">{t.message}</div>
            </div>
            {onDismiss && (
              <button
                className="toast-close"
                onClick={() => onDismiss(t.id)}
                aria-label="Dismiss toast"
              >
                <CloseIcon size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
