import React from 'react';
import {
  DashboardIcon,
  ScanIcon,
  ShieldIcon,
  CompareIcon,
  TerminalIcon,
  BookIcon,
  ExternalLinkIcon,
  CheckCircleIcon
} from './Icons.js';

export default function Sidebar({
  activeTab,
  onSelectTab,
  backendOnline = true,
  healthStatus = 'optimal'
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, badge: null },
    { id: 'scanner', label: 'Scanner', icon: ScanIcon, badge: 'Core' },
    { id: 'security', label: 'Security Checker', icon: ShieldIcon, badge: 'Audit' },
    { id: 'manager', label: 'Env Manager', icon: CompareIcon, badge: null },
    { id: 'cli', label: 'CLI Playground', icon: TerminalIcon, badge: 'Live' },
    { id: 'docs', label: 'Documentation', icon: BookIcon, badge: null }
  ];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo-glow">
          <ShieldIcon size={22} color="#38bdf8" />
        </div>
        <div className="brand-info">
          <div className="brand-name">
            EnvGuard <span className="brand-tag">CLI</span>
          </div>
          <div className="brand-sub">Playground & Inspector</div>
        </div>
      </div>

      <div className="sidebar-section-title">NAVIGATION</div>
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              className={`nav-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(item.id)}
            >
              <div className="nav-btn-content">
                <Icon size={18} className="nav-icon" />
                <span className="nav-label">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`nav-badge ${isActive ? 'nav-badge-active' : ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-engine-box">
        <div className="engine-status-row">
          <span className={`status-dot ${backendOnline ? 'online' : 'offline'}`} />
          <span className="engine-status-text">
            {backendOnline ? 'CLI Engine Connected' : 'Engine Offline'}
          </span>
        </div>
        <div className="package-tag-box">
          <div className="package-name">@sauravvbh/env-guard-cli</div>
          <div className="package-version">v1.0.0 &bull; Node.js CLI</div>
        </div>
      </div>

      <div className="sidebar-footer">
        <a
          href="https://www.npmjs.com/package/@sauravvbh/env-guard-cli"
          target="_blank"
          rel="noreferrer"
          className="external-nav-link"
        >
          <span>npm Registry</span>
          <ExternalLinkIcon size={13} />
        </a>
        <a
          href="https://github.com/sauravvbh-dotcom/Demo_pakage"
          target="_blank"
          rel="noreferrer"
          className="external-nav-link"
        >
          <span>GitHub Repo</span>
          <ExternalLinkIcon size={13} />
        </a>
      </div>
    </aside>
  );
}
