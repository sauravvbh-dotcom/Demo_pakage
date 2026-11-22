import React from 'react';
import { PlayIcon, RefreshIcon, ShieldIcon } from './Icons.js';

export default function Header({
  activeTab,
  scenarios = [],
  selectedScenarioId,
  onSelectScenario,
  onTriggerCheck,
  onTriggerSync,
  isScanning,
  healthScore = 100
}) {
  const titles = {
    dashboard: {
      title: 'Security & Health Dashboard',
      subtitle: 'Real-time overview of environment variables, coverage score, and configuration health.'
    },
    scanner: {
      title: 'Environment Scanner',
      subtitle: 'Scan codebases and compare process.env references against your .env configuration.'
    },
    security: {
      title: 'Security & Risk Checker',
      subtitle: 'Identify runtime crashes, secret exposure risks, and configuration drift.'
    },
    manager: {
      title: 'Environment Manager & Diff',
      subtitle: 'Safely inspect masked values and compare development, staging, and production environments.'
    },
    cli: {
      title: 'Interactive CLI Playground',
      subtitle: 'Execute actual @sauravvbh/env-guard-cli commands in a live sandboxed terminal.'
    },
    docs: {
      title: 'Package Documentation & Reference',
      subtitle: 'Technical guide, JavaScript API specifications, and CLI usage patterns.'
    }
  };

  const currentInfo = titles[activeTab] || titles.dashboard;

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="header-title">{currentInfo.title}</h1>
        <p className="header-subtitle">{currentInfo.subtitle}</p>
      </div>

      <div className="header-right">
        {/* Scenario Switcher */}
        <div className="scenario-select-wrapper">
          <label htmlFor="scenario-select" className="scenario-label">Scenario:</label>
          <select
            id="scenario-select"
            className="scenario-select"
            value={selectedScenarioId || ''}
            onChange={(e) => onSelectScenario(e.target.value)}
          >
            {scenarios.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name} ({sc.badge})
              </option>
            ))}
          </select>
        </div>

        {/* Quick Execution Actions */}
        <div className="header-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={onTriggerSync}
            disabled={isScanning}
            title="Execute package syncEnv to update .env.example"
          >
            <RefreshIcon size={14} className={isScanning ? 'spin' : ''} />
            <span>Sync .env.example</span>
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={onTriggerCheck}
            disabled={isScanning}
            title="Execute package checkEnv to validate configuration"
          >
            <PlayIcon size={12} />
            <span>Run --check</span>
          </button>
        </div>
      </div>
    </header>
  );
}
