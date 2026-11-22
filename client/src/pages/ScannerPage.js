import React, { useState } from 'react';
import CodeViewer from '../components/CodeViewer.js';
import Badge from '../components/Badge.js';
import {
  ScanIcon,
  PlayIcon,
  UploadIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  RefreshIcon,
  FileCodeIcon,
  TerminalIcon
} from '../components/Icons.js';

export default function ScannerPage({
  scenario,
  analysis,
  onScanCustom,
  onUploadEnvFile,
  onTriggerSync,
  isScanning,
  addToast
}) {
  const [activeTab, setActiveTab] = useState('variables'); // 'variables' | 'code' | 'raw-cli'
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [customEnv, setCustomEnv] = useState('');
  const [isEditingEnv, setIsEditingEnv] = useState(false);

  const codeFiles = scenario?.codeFiles || [];
  const activeCodeFile = codeFiles[selectedFileIdx] || codeFiles[0] || { path: 'src/app.js', content: '' };

  const missing = analysis?.missingVariables || [];
  const unused = analysis?.unusedVariables || [];
  const valid = analysis?.validVariables || [];
  const isHealthy = analysis?.isHealthy;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.includes('.env') && !file.name.endsWith('.txt')) {
      addToast({
        type: 'warning',
        title: 'File Type Warning',
        message: 'Please upload a valid .env format file.'
      });
    }

    onUploadEnvFile(file);
    e.target.value = '';
  };

  const handleApplyCustomEnv = () => {
    onScanCustom({
      scenarioId: scenario?.id,
      codeFiles,
      envContent: customEnv
    });
    setIsEditingEnv(false);
  };

  return (
    <div className="page-content scanner-page">
      {/* Top Action & Mode Bar */}
      <div className="scanner-action-bar">
        <div className="action-bar-left">
          <div className="scenario-indicator">
            <span className="text-muted">Scenario:</span>
            <strong>{scenario?.name || 'Active Project'}</strong>
          </div>
          <Badge variant={isHealthy ? 'success' : 'danger'}>
            {isHealthy ? 'All Env Vars Defined' : `${missing.length} Missing Var(s)`}
          </Badge>
        </div>

        <div className="action-bar-right">
          <label className="btn btn-secondary btn-sm upload-btn-label">
            <UploadIcon size={14} />
            <span>Upload .env File</span>
            <input
              type="file"
              accept=".env,.env.*,text/plain"
              onChange={handleFileUpload}
              className="hidden-file-input"
            />
          </label>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => onScanCustom({ scenarioId: scenario?.id })}
            disabled={isScanning}
          >
            <PlayIcon size={13} />
            <span>{isScanning ? 'Scanning...' : 'Re-scan with Package'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left is Variable Inspection & Reports, Right is Code & Env Viewer */}
      <div className="scanner-layout-grid">
        {/* Left Column: Validation Results */}
        <div className="scanner-results-column">
          {/* Status summary banner */}
          <div className={`scan-summary-card ${isHealthy ? 'healthy' : 'issues'}`}>
            <div className="summary-icon-box">
              {isHealthy ? (
                <CheckCircleIcon size={24} className="text-success" />
              ) : (
                <AlertCircleIcon size={24} className="text-danger" />
              )}
            </div>
            <div className="summary-text-box">
              <h4>{isHealthy ? 'checkEnv() Passed' : 'checkEnv() Validation Failed'}</h4>
              <p>
                {isHealthy
                  ? 'All environment variables used across source code exist in your .env file.'
                  : `Detected ${missing.length} missing variable(s) required by source code.`}
              </p>
            </div>
          </div>

          {/* Missing Variables Section */}
          <div className="variable-group-card group-danger">
            <div className="group-card-header">
              <div className="group-title-row">
                <AlertCircleIcon size={16} className="text-danger" />
                <span className="group-title">Missing in .env</span>
                <Badge variant="danger" size="sm">
                  {missing.length}
                </Badge>
              </div>
              <span className="group-subtitle">Referenced in code but undefined in .env</span>
            </div>

            <div className="group-card-body">
              {missing.length === 0 ? (
                <div className="group-empty-note text-success">
                  <CheckCircleIcon size={14} />
                  <span>No missing variables. Code will not crash on undefined env vars.</span>
                </div>
              ) : (
                <div className="variable-tag-list">
                  {missing.map((v) => (
                    <div key={v} className="variable-item-card var-missing">
                      <div className="var-header">
                        <span className="var-name font-mono">{v}</span>
                        <Badge variant="danger" size="sm">Missing</Badge>
                      </div>
                      <div className="var-detail">
                        <span>Used in code as:</span>
                        <code className="var-code-usage">process.env.{v}</code>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {missing.length > 0 && (
              <div className="group-card-footer">
                <button
                  className="btn btn-secondary btn-sm btn-block"
                  onClick={onTriggerSync}
                  disabled={isScanning}
                >
                  <RefreshIcon size={14} />
                  <span>Generate Missing into .env.example (CLI --sync)</span>
                </button>
              </div>
            )}
          </div>

          {/* Unused Variables Section */}
          <div className="variable-group-card group-warning">
            <div className="group-card-header">
              <div className="group-title-row">
                <AlertTriangleIcon size={16} className="text-warning" />
                <span className="group-title">Unused in Code</span>
                <Badge variant="warning" size="sm">
                  {unused.length}
                </Badge>
              </div>
              <span className="group-subtitle">Defined in .env but unreferenced by code</span>
            </div>

            <div className="group-card-body">
              {unused.length === 0 ? (
                <div className="group-empty-note text-muted">
                  <span>No unused variables found in .env. Configuration is lean.</span>
                </div>
              ) : (
                <div className="variable-tag-list">
                  {unused.map((v) => (
                    <div key={v} className="variable-item-card var-unused">
                      <div className="var-header">
                        <span className="var-name font-mono">{v}</span>
                        <Badge variant="warning" size="sm">Unused</Badge>
                      </div>
                      <div className="var-detail">
                        <span>Present in .env but zero references in source files</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Valid Variables Section */}
          <div className="variable-group-card group-success">
            <div className="group-card-header">
              <div className="group-title-row">
                <CheckCircleIcon size={16} className="text-success" />
                <span className="group-title">Active & Valid Variables</span>
                <Badge variant="success" size="sm">
                  {valid.length}
                </Badge>
              </div>
              <span className="group-subtitle">Used in code and resolved in .env</span>
            </div>

            <div className="group-card-body">
              {valid.length === 0 ? (
                <div className="group-empty-note text-muted">
                  <span>No active matching variables yet.</span>
                </div>
              ) : (
                <div className="variable-tag-list">
                  {valid.map((v) => (
                    <div key={v} className="variable-item-card var-valid">
                      <div className="var-header">
                        <span className="var-name font-mono">{v}</span>
                        <Badge variant="success" size="sm">Resolved</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Code Files, .env Inspection & Raw CLI Output */}
        <div className="scanner-code-column">
          <div className="code-column-tabs">
            <div className="tab-pill-group">
              <button
                className={`tab-pill ${activeTab === 'code' ? 'active' : ''}`}
                onClick={() => setActiveTab('code')}
              >
                <FileCodeIcon size={14} />
                <span>Source Files ({codeFiles.length})</span>
              </button>

              <button
                className={`tab-pill ${activeTab === 'variables' ? 'active' : ''}`}
                onClick={() => setActiveTab('variables')}
              >
                <ScanIcon size={14} />
                <span>.env Inspection</span>
              </button>

              <button
                className={`tab-pill ${activeTab === 'raw-cli' ? 'active' : ''}`}
                onClick={() => setActiveTab('raw-cli')}
              >
                <TerminalIcon size={14} />
                <span>Package checkEnv() Stdout</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Source Files */}
          {activeTab === 'code' && (
            <div className="tab-view-container">
              {codeFiles.length > 1 && (
                <div className="file-selector-row">
                  {codeFiles.map((file, idx) => (
                    <button
                      key={file.path}
                      className={`file-tab-btn ${selectedFileIdx === idx ? 'active' : ''}`}
                      onClick={() => setSelectedFileIdx(idx)}
                    >
                      <FileCodeIcon size={13} />
                      <span>{file.path}</span>
                    </button>
                  ))}
                </div>
              )}

              <CodeViewer
                code={activeCodeFile.content}
                fileName={activeCodeFile.path}
                language="javascript"
                highlightProcessEnv={true}
                maxHeight="460px"
                onCopySuccess={() =>
                  addToast({
                    type: 'success',
                    title: 'Copied',
                    message: `Copied ${activeCodeFile.path} to clipboard`
                  })
                }
              />
            </div>
          )}

          {/* Tab 2: .env Inspection & Masked Values */}
          {activeTab === 'variables' && (
            <div className="tab-view-container">
              <div className="env-inspector-card">
                <div className="inspector-header">
                  <div>
                    <h4 className="inspector-title">Active .env Configuration</h4>
                    <p className="inspector-sub">
                      Inspected by package parser. Real secret values are safely masked in the browser.
                    </p>
                  </div>
                  {!isEditingEnv ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setCustomEnv(scenario?.envContent || '');
                        setIsEditingEnv(true);
                      }}
                    >
                      Edit Raw .env
                    </button>
                  ) : (
                    <div className="edit-btn-group">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setIsEditingEnv(false)}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={handleApplyCustomEnv}
                      >
                        Apply & Scan
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingEnv ? (
                  <div className="masked-env-table-wrapper">
                    <table className="masked-env-table">
                      <thead>
                        <tr>
                          <th>Key</th>
                          <th>Value (Masked for Security)</th>
                          <th>Status in Code</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(analysis?.maskedEnvVars || []).map((entry) => {
                          const isUsed = valid.includes(entry.key);
                          return (
                            <tr key={entry.key}>
                              <td className="font-mono text-primary">{entry.key}</td>
                              <td className="font-mono text-muted">{entry.maskedValue}</td>
                              <td>
                                {isUsed ? (
                                  <Badge variant="success" size="sm">Used in Code</Badge>
                                ) : (
                                  <Badge variant="warning" size="sm">Unused</Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="custom-env-editor">
                    <textarea
                      className="env-textarea font-mono"
                      value={customEnv}
                      onChange={(e) => setCustomEnv(e.target.value)}
                      rows={12}
                      placeholder="KEY=VALUE"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab 3: Genuine Raw CLI Output */}
          {activeTab === 'raw-cli' && (
            <div className="tab-view-container">
              <div className="raw-cli-viewer">
                <div className="raw-cli-header">
                  <span className="font-mono text-sm text-secondary">
                    Package Function: checkEnv(dir, '.env')
                  </span>
                  <Badge variant={isHealthy ? 'success' : 'danger'} size="sm">
                    {isHealthy ? 'Exit 0' : 'Exit 1'}
                  </Badge>
                </div>
                <pre className="raw-cli-pre font-mono">
                  {analysis?.rawCliOutput || 'No output captured.'}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
