import React, { useState } from 'react';
import Badge from '../components/Badge.js';
import CodeViewer from '../components/CodeViewer.js';
import {
  BookIcon,
  ExternalLinkIcon,
  TerminalIcon,
  FileCodeIcon,
  CheckCircleIcon,
  CopyIcon,
  CheckIcon
} from '../components/Icons.js';

export default function DocsPage({ addToast }) {
  const [activeTab, setActiveTab] = useState('cli'); // 'cli' | 'api' | 'architecture'

  const copySnippet = (text, label) => {
    navigator.clipboard.writeText(text);
    addToast({
      type: 'success',
      title: 'Copied',
      message: `Copied ${label} to clipboard`
    });
  };

  const codeExample = `// src/server.js
import express from 'express';

const app = express();
const port = process.env.PORT || 3000;
const databaseUrl = process.env.DATABASE_URL;
const stripeKey = process.env.STRIPE_SECRET_KEY;

console.log('App starting on port:', port);`;

  const jsApiExample = `import {
  findFiles,
  scanVariables,
  parseEnvFile,
  checkEnv,
  syncEnv
} from '@sauravvbh/env-guard-cli';

// 1. Scan all process.env variables used in your code
const usedVars = scanVariables('./src');
console.log('Variables in code:', usedVars);

// 2. Parse existing .env keys
const definedVars = parseEnvFile('.env');
console.log('Variables in .env:', definedVars);

// 3. Compare and check health
const isHealthy = checkEnv('./src', '.env');
console.log('Config healthy?', isHealthy);

// 4. Automatically sync missing keys to .env.example
syncEnv('./src', '.env.example');`;

  return (
    <div className="page-content docs-page">
      {/* Overview Hero Card */}
      <div className="docs-hero-card">
        <div className="docs-hero-top">
          <div className="hero-package-badge font-mono">
            @sauravvbh/env-guard-cli v1.0.0
          </div>
          <div className="hero-links">
            <a
              href="https://www.npmjs.com/package/@sauravvbh/env-guard-cli"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <span>View on npm</span>
              <ExternalLinkIcon size={14} />
            </a>
            <a
              href="https://github.com/sauravvbh-dotcom/Demo_pakage"
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary btn-sm"
            >
              <span>GitHub Repo</span>
              <ExternalLinkIcon size={14} />
            </a>
          </div>
        </div>

        <h2 className="docs-hero-title">
          Zero-dependency CLI tool to scan and verify environment variables.
        </h2>
        <p className="docs-hero-desc">
          <code>@sauravvbh/env-guard-cli</code> scans your JavaScript, TypeScript, and JSX codebases
          for <code>process.env</code> references, compares them against your <code>.env</code> file,
          flags missing or unused variables, and synchronizes your <code>.env.example</code> templates.
        </p>

        {/* Quick Install Banner */}
        <div className="install-banner">
          <span className="install-label">Installation:</span>
          <code className="install-code font-mono">npm install -D @sauravvbh/env-guard-cli</code>
          <button
            className="install-copy-btn"
            onClick={() => copySnippet('npm install -D @sauravvbh/env-guard-cli', 'install command')}
            title="Copy install command"
          >
            <CopyIcon size={14} />
          </button>
        </div>
      </div>

      {/* Docs Tabs */}
      <div className="docs-nav-tabs">
        <button
          className={`tab-pill ${activeTab === 'cli' ? 'active' : ''}`}
          onClick={() => setActiveTab('cli')}
        >
          <TerminalIcon size={15} />
          <span>CLI Reference</span>
        </button>
        <button
          className={`tab-pill ${activeTab === 'api' ? 'active' : ''}`}
          onClick={() => setActiveTab('api')}
        >
          <FileCodeIcon size={15} />
          <span>JavaScript API</span>
        </button>
        <button
          className={`tab-pill ${activeTab === 'architecture' ? 'active' : ''}`}
          onClick={() => setActiveTab('architecture')}
        >
          <BookIcon size={15} />
          <span>How It Works & Integration</span>
        </button>
      </div>

      {/* Tab 1: CLI Reference */}
      {activeTab === 'cli' && (
        <div className="docs-section">
          <h3>Supported CLI Commands</h3>
          <p className="section-intro">
            The package provides zero-overhead CLI commands that can be invoked via <code>npx</code> or
            added to your project&apos;s <code>package.json</code> scripts.
          </p>

          <div className="command-cards-list">
            <div className="command-doc-card">
              <div className="cmd-header">
                <code className="font-mono cmd-name">npx @sauravvbh/env-guard-cli --check</code>
                <Badge variant="primary" size="sm">Core Verification</Badge>
              </div>
              <p className="cmd-desc">
                Scans all source code files in the directory recursively (ignoring <code>node_modules</code>, <code>.git</code>, <code>dist</code>, and <code>build</code>),
                extracts all <code>process.env.VARIABLE</code> references, and parses <code>.env</code>.
              </p>
              <div className="cmd-details">
                <div className="detail-item">
                  <strong>Output:</strong> Prints missing variables, unused variables, and validation status.
                </div>
                <div className="detail-item">
                  <strong>Exit Code:</strong> <code>0</code> when all variables in code exist in <code>.env</code>; <code>1</code> when missing variables are found.
                </div>
                <div className="detail-item">
                  <strong>CI/CD Usage:</strong> Ideal for pre-commit hooks or GitHub Actions to prevent broken deployments.
                </div>
              </div>
            </div>

            <div className="command-doc-card">
              <div className="cmd-header">
                <code className="font-mono cmd-name">npx @sauravvbh/env-guard-cli --sync</code>
                <Badge variant="info" size="sm">Template Generator</Badge>
              </div>
              <p className="cmd-desc">
                Finds all environment variables used in your code that are not yet present in <code>.env.example</code>,
                and appends them with blank values (e.g. <code>NEW_VAR=</code>).
              </p>
              <div className="cmd-details">
                <div className="detail-item">
                  <strong>Output:</strong> <code>Updated .env.example with X new variable(s).</code> or <code>.env.example is already up to date.</code>
                </div>
                <div className="detail-item">
                  <strong>Safety:</strong> Never writes real secret values into <code>.env.example</code>.
                </div>
              </div>
            </div>

            <div className="command-doc-card">
              <div className="cmd-header">
                <code className="font-mono cmd-name">npx @sauravvbh/env-guard-cli --help</code>
                <Badge variant="neutral" size="sm">Usage Help</Badge>
              </div>
              <p className="cmd-desc">
                Displays the package summary banner, usage examples, and available flags (<code>--check</code>, <code>--sync</code>, <code>--help</code>).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: JavaScript API */}
      {activeTab === 'api' && (
        <div className="docs-section">
          <h3>Programmatic JavaScript API</h3>
          <p className="section-intro">
            <code>@sauravvbh/env-guard-cli</code> exports 5 pure JavaScript functions from its main module:
          </p>

          <div className="api-functions-grid">
            <div className="api-func-card">
              <div className="func-signature font-mono">
                findFiles(dir = &apos;.&apos;) : string[]
              </div>
              <p>Recursively traverses directory to locate supported files (<code>.js</code>, <code>.mjs</code>, <code>.cjs</code>, <code>.jsx</code>, <code>.ts</code>, <code>.tsx</code>), ignoring <code>node_modules</code>, <code>.git</code>, <code>dist</code>, and <code>build</code>.</p>
            </div>

            <div className="api-func-card">
              <div className="func-signature font-mono">
                scanVariables(dir = &apos;.&apos;) : string[]
              </div>
              <p>Scans matching source files using regex <code>/process\.env\.([A-Za-z0-9_]+)/g</code> and returns a sorted array of unique variable names found in code.</p>
            </div>

            <div className="api-func-card">
              <div className="func-signature font-mono">
                parseEnvFile(filePath = &apos;.env&apos;) : Set&lt;string&gt;
              </div>
              <p>Parses an environment file, skips comments (<code>#</code>) and empty lines, extracts variable keys before <code>=</code>, and returns a <code>Set&lt;string&gt;</code>.</p>
            </div>

            <div className="api-func-card">
              <div className="func-signature font-mono">
                checkEnv(dir = &apos;.&apos;, envFile = &apos;.env&apos;) : boolean
              </div>
              <p>Compares variables in code against defined variables in <code>.env</code>. Logs missing and unused variables to stdout, and returns <code>true</code> if missing is empty, <code>false</code> otherwise.</p>
            </div>

            <div className="api-func-card">
              <div className="func-signature font-mono">
                syncEnv(dir = &apos;.&apos;, exampleFile = &apos;.env.example&apos;) : void
              </div>
              <p>Scans variables used in code and appends any missing ones as empty key declarations (<code>KEY=</code>) into <code>.env.example</code>.</p>
            </div>
          </div>

          <div className="docs-code-example">
            <h4>Full Node.js Integration Example</h4>
            <CodeViewer
              code={jsApiExample}
              fileName="integrate-env-guard.js"
              language="javascript"
              onCopySuccess={() => copySnippet(jsApiExample, 'JS API example')}
            />
          </div>
        </div>
      )}

      {/* Tab 3: Architecture & Integration */}
      {activeTab === 'architecture' && (
        <div className="docs-section">
          <h3>How EnvGuard Playground Integrates the Package</h3>
          <p className="section-intro">
            This playground runs a real Node.js backend integrating <code>@sauravvbh/env-guard-cli</code> without mocking or simulated logic.
          </p>

          <div className="arch-workflow-card">
            <div className="workflow-step">
              <div className="step-num">1</div>
              <div className="step-content">
                <strong>Workspace Isolation</strong>
                <p>When you scan a scenario or execute a CLI command, the backend creates a secure temporary workspace containing the project files.</p>
              </div>
            </div>

            <div className="workflow-step">
              <div className="step-num">2</div>
              <div className="step-content">
                <strong>Genuine API & CLI Execution</strong>
                <p>The backend calls the genuine exported functions (<code>scanVariables</code>, <code>parseEnvFile</code>, <code>checkEnv</code>) and runs the real CLI binary with <code>child_process.execFile</code>.</p>
              </div>
            </div>

            <div className="workflow-step">
              <div className="step-num">3</div>
              <div className="step-content">
                <strong>Zero-Leak Secret Masking</strong>
                <p>Before any response is sent back to the React client, secret values are sanitized and masked (e.g. <code>••••••••</code>), guaranteeing that production secrets are never leaked.</p>
              </div>
            </div>

            <div className="workflow-step">
              <div className="step-num">4</div>
              <div className="step-content">
                <strong>Real-time UI Visualization</strong>
                <p>Results, stdout logs, health scores, and suggestions are rendered live in this Vercel/Linear-inspired dark interface.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
