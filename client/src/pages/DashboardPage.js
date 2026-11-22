import React from 'react';
import StatCard from '../components/StatCard.js';
import Badge from '../components/Badge.js';
import {
  DashboardIcon,
  ScanIcon,
  ShieldIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  RefreshIcon,
  TerminalIcon,
  FileCodeIcon,
  ChevronRightIcon
} from '../components/Icons.js';

export default function DashboardPage({
  analysis,
  scenario,
  onNavigate,
  onTriggerSync,
  onTriggerCheck,
  isScanning
}) {
  if (!analysis) {
    return (
      <div className="empty-state-box">
        <RefreshIcon size={32} className="spin text-primary" />
        <p>Loading environment analysis...</p>
      </div>
    );
  }

  const {
    healthScore = 0,
    status = 'optimal',
    isHealthy = false,
    totalVariablesInCode = 0,
    totalVariablesInEnv = 0,
    missingVariables = [],
    unusedVariables = [],
    validVariables = [],
    exampleVariables = [],
    exampleMissingVariables = [],
    scannedFiles = [],
    suggestions = []
  } = analysis;

  const getStatusColor = () => {
    if (status === 'critical') return 'danger';
    if (status === 'warning') return 'warning';
    return 'success';
  };

  const getStatusLabel = () => {
    if (status === 'critical') return 'Critical Issues Detected';
    if (status === 'warning') return 'Attention Required';
    return 'Configuration Optimal';
  };

  return (
    <div className="page-content dashboard-page">
      {/* Active Scenario Overview Banner */}
      {scenario && (
        <div className="scenario-banner">
          <div className="scenario-banner-info">
            <div className="scenario-banner-top">
              <span className="scenario-banner-title">{scenario.name}</span>
              <Badge variant={scenario.badgeVariant || 'neutral'}>
                {scenario.badge}
              </Badge>
            </div>
            <p className="scenario-banner-desc">{scenario.description}</p>
          </div>
          <div className="scenario-banner-stats">
            <div className="banner-stat-item">
              <span className="banner-stat-label">Files Scanned</span>
              <span className="banner-stat-val">{scannedFiles.length}</span>
            </div>
            <div className="banner-stat-item">
              <span className="banner-stat-label">Code References</span>
              <span className="banner-stat-val">{totalVariablesInCode}</span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Statistics Grid */}
      <div className="stats-grid">
        <StatCard
          title="Variables in Code"
          value={totalVariablesInCode}
          subtitle={`Detected across ${scannedFiles.length} file(s)`}
          icon={<FileCodeIcon size={20} />}
          badgeText="process.env"
          badgeVariant="info"
          accentColor="blue"
        />

        <StatCard
          title="Defined in .env"
          value={totalVariablesInEnv}
          subtitle={`${validVariables.length} active in application`}
          icon={<CheckCircleIcon size={20} />}
          badgeText={totalVariablesInEnv > 0 ? 'Active' : 'Missing .env'}
          badgeVariant={totalVariablesInEnv > 0 ? 'success' : 'danger'}
          accentColor="emerald"
        />

        <StatCard
          title="Missing Variables"
          value={missingVariables.length}
          subtitle={missingVariables.length > 0 ? 'Runtime crash risk' : 'Zero missing vars'}
          icon={<AlertCircleIcon size={20} />}
          badgeText={missingVariables.length > 0 ? 'High Risk' : 'Secure'}
          badgeVariant={missingVariables.length > 0 ? 'danger' : 'success'}
          accentColor={missingVariables.length > 0 ? 'rose' : 'emerald'}
        />

        <StatCard
          title="Unused / Dead Keys"
          value={unusedVariables.length}
          subtitle={unusedVariables.length > 0 ? 'Obsolete credentials in .env' : 'Clean config'}
          icon={<AlertTriangleIcon size={20} />}
          badgeText={unusedVariables.length > 0 ? 'Dead Weight' : 'Clean'}
          badgeVariant={unusedVariables.length > 0 ? 'warning' : 'neutral'}
          accentColor={unusedVariables.length > 0 ? 'amber' : 'purple'}
        />
      </div>

      {/* Main Health & Overview Section */}
      <div className="dashboard-main-grid">
        {/* Health Score Card */}
        <div className="dash-card health-score-card">
          <div className="dash-card-header">
            <div className="card-title-group">
              <ShieldIcon size={18} className={`text-${getStatusColor()}`} />
              <h3 className="card-title">Environment Health Score</h3>
            </div>
            <Badge variant={getStatusColor()}>{getStatusLabel()}</Badge>
          </div>

          <div className="health-score-body">
            <div className="gauge-wrapper">
              <div className={`gauge-circle gauge-${getStatusColor()}`}>
                <div className="gauge-inner">
                  <span className="gauge-number">{healthScore}%</span>
                  <span className="gauge-caption">Coverage</span>
                </div>
              </div>
            </div>

            <div className="health-breakdown-list">
              <div className="health-breakdown-row">
                <span className="breakdown-label">
                  <span className="indicator-dot dot-success" /> Valid & Resolved
                </span>
                <span className="breakdown-val font-mono">
                  {validVariables.length} / {totalVariablesInCode}
                </span>
              </div>

              <div className="health-breakdown-row">
                <span className="breakdown-label">
                  <span className="indicator-dot dot-danger" /> Missing in .env
                </span>
                <span className="breakdown-val font-mono text-danger">
                  {missingVariables.length}
                </span>
              </div>

              <div className="health-breakdown-row">
                <span className="breakdown-label">
                  <span className="indicator-dot dot-warning" /> Unreferenced in Code
                </span>
                <span className="breakdown-val font-mono text-warning">
                  {unusedVariables.length}
                </span>
              </div>

              <div className="health-breakdown-row">
                <span className="breakdown-label">
                  <span className="indicator-dot dot-info" /> Missing in .env.example
                </span>
                <span className="breakdown-val font-mono text-info">
                  {exampleMissingVariables.length}
                </span>
              </div>
            </div>
          </div>

          <div className="health-card-footer">
            {exampleMissingVariables.length > 0 ? (
              <button
                className="btn btn-secondary btn-block"
                onClick={onTriggerSync}
                disabled={isScanning}
              >
                <RefreshIcon size={14} />
                <span>Sync {exampleMissingVariables.length} Missing Key(s) to .env.example</span>
              </button>
            ) : (
              <div className="all-synced-note">
                <CheckCircleIcon size={14} className="text-success" />
                <span>All variables synchronized with .env.example template</span>
              </div>
            )}
          </div>
        </div>

        {/* Security Recommendations & Actionable Insights */}
        <div className="dash-card insights-card">
          <div className="dash-card-header">
            <div className="card-title-group">
              <AlertTriangleIcon size={18} className="text-warning" />
              <h3 className="card-title">Security Insights & Recommendations</h3>
            </div>
            <span className="text-muted text-sm">{suggestions.length} finding(s)</span>
          </div>

          <div className="insights-list">
            {suggestions.map((item, idx) => (
              <div key={idx} className={`insight-item insight-${item.type}`}>
                <div className="insight-header">
                  <span className="insight-title">{item.title}</span>
                  <Badge variant={item.type} size="sm">
                    {item.type.toUpperCase()}
                  </Badge>
                </div>
                <p className="insight-message">{item.message}</p>
                <div className="insight-action">
                  <strong>Recommended Fix:</strong> {item.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launchpad to Core Modules */}
      <div className="launchpad-section">
        <h3 className="section-heading">Quick Playground Navigation</h3>
        <div className="launchpad-grid">
          <div className="launchpad-card" onClick={() => onNavigate('scanner')}>
            <div className="launchpad-icon-box text-blue">
              <ScanIcon size={24} />
            </div>
            <div className="launchpad-content">
              <h4>Environment Scanner</h4>
              <p>Inspect detailed variable mappings, code files, and validation errors.</p>
            </div>
            <ChevronRightIcon size={18} className="launchpad-arrow" />
          </div>

          <div className="launchpad-card" onClick={() => onNavigate('cli')}>
            <div className="launchpad-icon-box text-emerald">
              <TerminalIcon size={24} />
            </div>
            <div className="launchpad-content">
              <h4>CLI Playground</h4>
              <p>Execute actual @sauravvbh/env-guard-cli commands in a live sandboxed terminal.</p>
            </div>
            <ChevronRightIcon size={18} className="launchpad-arrow" />
          </div>

          <div className="launchpad-card" onClick={() => onNavigate('manager')}>
            <div className="launchpad-icon-box text-purple">
              <DashboardIcon size={24} />
            </div>
            <div className="launchpad-content">
              <h4>Environment Manager</h4>
              <p>Compare development vs production variables and inspect masked values.</p>
            </div>
            <ChevronRightIcon size={18} className="launchpad-arrow" />
          </div>
        </div>
      </div>
    </div>
  );
}
