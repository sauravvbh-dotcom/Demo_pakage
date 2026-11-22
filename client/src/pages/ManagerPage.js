import React, { useState, useEffect } from 'react';
import Badge from '../components/Badge.js';
import {
  CompareIcon,
  RefreshIcon,
  CopyIcon,
  CheckIcon,
  UploadIcon,
  EyeIcon,
  EyeOffIcon
} from '../components/Icons.js';
import { fetchEnvironments, compareEnvironments } from '../services/api.js';

export default function ManagerPage({ addToast }) {
  const [environments, setEnvironments] = useState(null);
  const [envAKey, setEnvAKey] = useState('development');
  const [envBKey, setEnvBKey] = useState('production');
  const [comparison, setComparison] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all' | 'diff' | 'missing'

  // Load preset environments from backend on mount
  useEffect(() => {
    loadEnvironments();
  }, []);

  const loadEnvironments = async () => {
    try {
      setIsLoading(true);
      const res = await fetchEnvironments();
      if (res.success && res.environments) {
        setEnvironments(res.environments);
        runComparison(
          res.environments.development,
          res.environments.production,
          'Development (.env.development)',
          'Production (.env.production)'
        );
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to load environments',
        message: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runComparison = async (contentA, contentB, labelA, labelB) => {
    try {
      setIsLoading(true);
      const res = await compareEnvironments({
        envA: contentA,
        envB: contentB,
        labelA,
        labelB
      });
      if (res.success) {
        setComparison(res);
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Comparison Error',
        message: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectEnvA = (key) => {
    setEnvAKey(key);
    if (environments) {
      runComparison(
        environments[key],
        environments[envBKey],
        getEnvLabel(key),
        getEnvLabel(envBKey)
      );
    }
  };

  const handleSelectEnvB = (key) => {
    setEnvBKey(key);
    if (environments) {
      runComparison(
        environments[envAKey],
        environments[key],
        getEnvLabel(envAKey),
        getEnvLabel(key)
      );
    }
  };

  const getEnvLabel = (key) => {
    switch (key) {
      case 'development':
        return 'Development (.env.development)';
      case 'production':
        return 'Production (.env.production)';
      case 'staging':
        return 'Staging (.env.staging)';
      case 'example':
        return 'Example (.env.example)';
      default:
        return key;
    }
  };

  const rows = comparison?.rows || [];
  const filteredRows = rows.filter((r) => {
    if (filter === 'diff') return r.status !== 'synced';
    if (filter === 'missing') return r.status === 'only_in_a' || r.status === 'only_in_b';
    return true;
  });

  const summary = comparison?.summary || {
    totalKeysCombined: 0,
    keysInA: 0,
    keysInB: 0,
    onlyInA: 0,
    onlyInB: 0,
    sharedKeys: 0
  };

  const handleCopyEnv = (content, name) => {
    navigator.clipboard.writeText(content);
    addToast({
      type: 'success',
      title: 'Copied',
      message: `Copied ${name} configuration to clipboard`
    });
  };

  return (
    <div className="page-content manager-page">
      {/* Selector & Action Bar */}
      <div className="manager-header-card">
        <div className="env-pickers-row">
          <div className="env-picker-box">
            <label className="picker-label">Environment A (Base):</label>
            <select
              className="env-select"
              value={envAKey}
              onChange={(e) => handleSelectEnvA(e.target.value)}
            >
              <option value="development">Development (.env.development)</option>
              <option value="staging">Staging (.env.staging)</option>
              <option value="production">Production (.env.production)</option>
              <option value="example">Example (.env.example)</option>
            </select>
          </div>

          <div className="compare-icon-badge">
            <CompareIcon size={20} className="text-primary" />
          </div>

          <div className="env-picker-box">
            <label className="picker-label">Environment B (Target):</label>
            <select
              className="env-select"
              value={envBKey}
              onChange={(e) => handleSelectEnvB(e.target.value)}
            >
              <option value="production">Production (.env.production)</option>
              <option value="staging">Staging (.env.staging)</option>
              <option value="development">Development (.env.development)</option>
              <option value="example">Example (.env.example)</option>
            </select>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="filter-pills-row">
          <span className="filter-label">Filter View:</span>
          <div className="tab-pill-group">
            <button
              className={`tab-pill ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Keys ({summary.totalKeysCombined})
            </button>
            <button
              className={`tab-pill ${filter === 'diff' ? 'active' : ''}`}
              onClick={() => setFilter('diff')}
            >
              Differences ({summary.onlyInA + summary.onlyInB})
            </button>
            <button
              className={`tab-pill ${filter === 'missing' ? 'active' : ''}`}
              onClick={() => setFilter('missing')}
            >
              Missing In Either ({summary.onlyInA + summary.onlyInB})
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Summary Metrics */}
      <div className="manager-summary-grid">
        <div className="summary-stat-box">
          <span className="stat-label">Total Unique Keys</span>
          <span className="stat-number">{summary.totalKeysCombined}</span>
        </div>
        <div className="summary-stat-box">
          <span className="stat-label">Shared Keys</span>
          <span className="stat-number text-success">{summary.sharedKeys}</span>
        </div>
        <div className="summary-stat-box">
          <span className="stat-label">Only in {comparison?.labelA || 'Env A'}</span>
          <span className="stat-number text-warning">{summary.onlyInA}</span>
        </div>
        <div className="summary-stat-box">
          <span className="stat-label">Only in {comparison?.labelB || 'Env B'}</span>
          <span className="stat-number text-danger">{summary.onlyInB}</span>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="comparison-table-card">
        <div className="table-card-header">
          <h3>Environment Comparison Diff</h3>
          <span className="text-muted text-sm">
            Showing {filteredRows.length} of {rows.length} keys
          </span>
        </div>

        <div className="table-responsive">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Variable Key</th>
                <th>{comparison?.labelA || 'Env A'}</th>
                <th>{comparison?.labelB || 'Env B'}</th>
                <th>Comparison Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => {
                let badgeVariant = 'success';
                let statusLabel = 'Synced';

                if (row.status === 'only_in_a') {
                  badgeVariant = 'warning';
                  statusLabel = `Missing in ${comparison?.labelB || 'Env B'}`;
                } else if (row.status === 'only_in_b') {
                  badgeVariant = 'danger';
                  statusLabel = `Missing in ${comparison?.labelA || 'Env A'}`;
                } else if (row.status === 'different_values') {
                  badgeVariant = 'info';
                  statusLabel = 'Different Values';
                }

                return (
                  <tr key={row.key} className={`row-status-${row.status}`}>
                    <td className="font-mono font-bold text-primary">{row.key}</td>
                    <td className="font-mono">
                      {row.inA ? (
                        <span className="masked-preview">{row.valA}</span>
                      ) : (
                        <span className="not-present-tag">— Not Defined —</span>
                      )}
                    </td>
                    <td className="font-mono">
                      {row.inB ? (
                        <span className="masked-preview">{row.valB}</span>
                      ) : (
                        <span className="not-present-tag">— Not Defined —</span>
                      )}
                    </td>
                    <td>
                      <Badge variant={badgeVariant} size="sm">
                        {statusLabel}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export & Fast Copy Section */}
      <div className="export-section-card">
        <div className="export-info">
          <h4>Safe Configuration Templates</h4>
          <p>
            Copy safe, sanitized environment blueprints for your team or CI/CD pipelines.
          </p>
        </div>
        <div className="export-actions">
          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              handleCopyEnv(
                environments?.[envAKey] || '',
                comparison?.labelA || 'Base Env'
              )
            }
          >
            <CopyIcon size={14} />
            <span>Copy {comparison?.labelA || 'Env A'}</span>
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() =>
              handleCopyEnv(
                environments?.example || '',
                '.env.example'
              )
            }
          >
            <CopyIcon size={14} />
            <span>Copy .env.example Template</span>
          </button>
        </div>
      </div>
    </div>
  );
}
