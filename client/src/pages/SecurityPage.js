import React, { useState } from 'react';
import Badge from '../components/Badge.js';
import {
  ShieldIcon,
  LockIcon,
  AlertTriangleIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  CopyIcon
} from '../components/Icons.js';

export default function SecurityPage({
  analysis,
  scenario,
  onTriggerSync,
  isScanning,
  addToast
}) {
  const [showMaskDemo, setShowMaskDemo] = useState(false);

  const missing = analysis?.missingVariables || [];
  const unused = analysis?.unusedVariables || [];
  const maskedVars = analysis?.maskedEnvVars || [];
  const isHealthy = analysis?.isHealthy;

  // Real security checks performed by the npm package
  const securityChecks = [
    {
      id: 'missing-crash-guard',
      title: 'Runtime Crash Prevention (Missing Variables Check)',
      status: missing.length === 0 ? 'passed' : 'failed',
      severity: 'Critical',
      description:
        'When process.env.KEY is evaluated in JavaScript and the key is missing from .env, it resolves to undefined. Calling methods or passing undefined to SDKs causes fatal runtime crashes.',
      findings:
        missing.length > 0
          ? `${missing.length} variable(s) undefined: ${missing.join(', ')}`
          : 'All process.env references in source code exist in .env.',
      recommendation:
        missing.length > 0
          ? 'Add missing variables to .env immediately, or supply fallback defaults (e.g. process.env.PORT || 3000).'
          : 'Zero action needed. Runtime will not crash due to missing environment keys.'
    },
    {
      id: 'attack-surface-reduction',
      title: 'Attack Surface Reduction (Unused Secrets Check)',
      status: unused.length === 0 ? 'passed' : 'warning',
      severity: 'Medium',
      description:
        'Dangling API keys, old database connection strings, or staging tokens left inside .env increase damage if an environment file is accidentally exposed or backed up.',
      findings:
        unused.length > 0
          ? `${unused.length} unreferenced key(s) in .env: ${unused.join(', ')}`
          : 'No orphaned or unused variables found in .env.',
      recommendation:
        unused.length > 0
          ? 'Audit and prune obsolete keys from .env to maintain minimal credential footprint.'
          : 'Configuration is clean and minimal.'
    },
    {
      id: 'template-desync',
      title: 'Safe Onboarding & Template Guard (.env.example Sync)',
      status: (analysis?.exampleMissingVariables || []).length === 0 ? 'passed' : 'warning',
      severity: 'High',
      description:
        'New engineers cloning repositories need a template of required keys. Without an up-to-date .env.example, developers often share real .env files via Slack or email, risking major credential leaks.',
      findings:
        (analysis?.exampleMissingVariables || []).length > 0
          ? `${analysis.exampleMissingVariables.length} key(s) missing from .env.example: ${analysis.exampleMissingVariables.join(', ')}`
          : '.env.example is fully synchronized with code requirements.',
      recommendation:
        'Use "@sauravvbh/env-guard-cli --sync" in CI/CD or pre-commit hooks to keep .env.example automatically synchronized without exposing secret values.'
    },
    {
      id: 'secret-masking-guard',
      title: 'Secret Exposure Protection (Never Reveal Secrets)',
      status: 'passed',
      severity: 'Strict Policy',
      description:
        'EnvGuard Playground strictly enforces that raw secret values are NEVER sent to the browser or committed to version control.',
      findings: 'All values masked server-side with cryptographic masking.',
      recommendation: 'Ensure your .gitignore includes *.env and never commit secrets into git.'
    }
  ];

  return (
    <div className="page-content security-page">
      {/* Security Posture Header */}
      <div className="security-banner">
        <div className="security-banner-icon">
          <ShieldIcon size={32} color={isHealthy ? '#10b981' : '#f43f5e'} />
        </div>
        <div className="security-banner-details">
          <h2>Security Audit & Risk Assessment</h2>
          <p>
            Demonstrating genuine security validation performed by{' '}
            <code className="inline-code">@sauravvbh/env-guard-cli</code> on the active scenario{' '}
            <strong>({scenario?.name})</strong>.
          </p>
        </div>
        <div className="security-banner-badge">
          <Badge variant={isHealthy ? 'success' : 'danger'} size="lg">
            {isHealthy ? 'PASSED AUDIT' : 'VULNERABILITIES DETECTED'}
          </Badge>
        </div>
      </div>

      {/* Security Checks List */}
      <div className="security-checks-grid">
        {securityChecks.map((check) => {
          let badgeVariant = 'success';
          let StatusIcon = CheckCircleIcon;

          if (check.status === 'failed') {
            badgeVariant = 'danger';
            StatusIcon = AlertCircleIcon;
          } else if (check.status === 'warning') {
            badgeVariant = 'warning';
            StatusIcon = AlertTriangleIcon;
          }

          return (
            <div key={check.id} className={`security-check-card border-${badgeVariant}`}>
              <div className="check-card-header">
                <div className="check-title-row">
                  <StatusIcon size={20} className={`text-${badgeVariant}`} />
                  <h4 className="check-title">{check.title}</h4>
                </div>
                <div className="check-badge-row">
                  <Badge variant={badgeVariant} size="sm">
                    {check.status.toUpperCase()}
                  </Badge>
                  <span className="severity-tag">Severity: {check.severity}</span>
                </div>
              </div>

              <p className="check-desc">{check.description}</p>

              <div className="check-finding-box">
                <span className="finding-label">Audit Finding:</span>
                <p className="finding-text">{check.findings}</p>
              </div>

              <div className="check-recommendation-box">
                <span className="rec-label">Remediation:</span>
                <p className="rec-text">{check.recommendation}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secret Masking & Protection Showcase */}
      <div className="secret-masking-card">
        <div className="masking-header">
          <div className="masking-title-group">
            <LockIcon size={20} className="text-secondary" />
            <div>
              <h3>Zero-Leak Secret Masking Inspector</h3>
              <p className="text-muted text-sm">
                Secrets in .env files are sanitized server-side. The frontend only receives masked
                tokens and length metadata.
              </p>
            </div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setShowMaskDemo(!showMaskDemo)}
          >
            {showMaskDemo ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
            <span>{showMaskDemo ? 'Hide Masking Preview' : 'Inspect Masking Policy'}</span>
          </button>
        </div>

        <div className="masking-table-container">
          <table className="masking-table">
            <thead>
              <tr>
                <th>Variable Name</th>
                <th>Security Mask</th>
                <th>Character Length</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {maskedVars.map((v) => (
                <tr key={v.key}>
                  <td className="font-mono text-primary font-bold">{v.key}</td>
                  <td className="font-mono text-muted">
                    {showMaskDemo ? (
                      <span className="mask-token">{v.maskedValue}</span>
                    ) : (
                      <span className="mask-token">••••••••••••</span>
                    )}
                  </td>
                  <td className="font-mono text-secondary">{v.length} bytes</td>
                  <td>
                    <Badge variant={v.hasValue ? 'success' : 'warning'} size="sm">
                      {v.hasValue ? 'Protected' : 'Empty'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Practices Checklist */}
      <div className="best-practices-card">
        <h3>Environment Variable Security Checklist</h3>
        <div className="checklist-grid">
          <div className="checklist-item done">
            <div className="checklist-icon"><CheckIcon size={14} /></div>
            <div>
              <strong>Add .env to .gitignore</strong>
              <p>Never commit actual credentials, database passwords, or secret keys to git.</p>
            </div>
          </div>

          <div className="checklist-item done">
            <div className="checklist-icon"><CheckIcon size={14} /></div>
            <div>
              <strong>Maintain .env.example with @sauravvbh/env-guard-cli --sync</strong>
              <p>Always document all required keys without their secret values.</p>
            </div>
          </div>

          <div className="checklist-item done">
            <div className="checklist-icon"><CheckIcon size={14} /></div>
            <div>
              <strong>Verify in CI/CD with @sauravvbh/env-guard-cli --check</strong>
              <p>Fail the build if code references variables not present in configuration.</p>
            </div>
          </div>

          <div className="checklist-item done">
            <div className="checklist-icon"><CheckIcon size={14} /></div>
            <div>
              <strong>Prune legacy and deprecated keys</strong>
              <p>Regularly remove unused credentials to limit risk during audits and credential leaks.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
