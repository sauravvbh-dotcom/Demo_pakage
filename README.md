# EnvGuard Playground

> Interactive developer dashboard and security playground demonstrating the **[`@sauravvbh/env-guard-cli`](https://www.npmjs.com/package/@sauravvbh/env-guard-cli)** npm package.

[![npm version](https://img.shields.io/npm/v/@sauravvbh/env-guard-cli.svg?style=flat-square&color=38bdf8)](https://www.npmjs.com/package/@sauravvbh/env-guard-cli)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-10b981?style=flat-square)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.3-61dafb?style=flat-square)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-4.21-white?style=flat-square)](https://expressjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-a855f7?style=flat-square)](LICENSE)

---

## 🌟 Overview

**EnvGuard Playground** is a production-grade web application designed to showcase and test the full capabilities of the published npm package **[`@sauravvbh/env-guard-cli`](https://www.npmjs.com/package/@sauravvbh/env-guard-cli)**. 

Inspired by modern developer platforms like **Vercel**, **Linear**, and **Raycast**, EnvGuard Playground features a dark dashboard that connects directly to a Node.js backend executing the genuine npm package logic and real CLI binary in isolated workspaces.

---

## ✨ Features

### A. Security & Health Dashboard
- **Coverage Health Gauge:** Visual 0–100% health meter evaluating the ratio of defined variables against source code requirements.
- **Metric Cards:** Real-time counters for Variables in Code, Defined in `.env`, Missing Variables (critical crash risk), and Unused Variables (credential bloat).
- **Security Insights:** Dynamic remediation recommendations generated directly from analysis results.
- **Quick Launchpad:** Seamless one-click jumps to the Scanner, Terminal Playground, and Environment Manager.

### B. Environment Scanner
- **Active Code Inspection:** Multi-file code viewer highlighting `process.env.*` variable references with token badges.
- **Validation Engine:** Direct execution of `@sauravvbh/env-guard-cli`'s `checkEnv()`, `scanVariables()`, and `parseEnvFile()`.
- **Tri-State Categorization:**
  - 🚨 **Missing Variables:** Used in source code but missing in `.env` (causes runtime crashes).
  - ⚠️ **Unused Variables:** Defined in `.env` but never referenced in code (dangling secrets).
  - ✅ **Valid Variables:** Fully resolved and mapped environment keys.
- **File Upload:** Upload any `.env` file to scan against code in real time.
- **1-Click Sync:** Automatically invoke the package's `syncEnv()` to generate missing templates into `.env.example`.

### C. Security Checker & Audit
- **Crash Prevention Audit:** Verifies that missing environment keys won't cause runtime `TypeError: Cannot read properties of undefined`.
- **Attack Surface Audit:** Flags obsolete and orphaned credentials inside `.env` to prevent credential exposure.
- **Template Guard:** Ensures team onboarding templates (`.env.example`) are synchronized so engineers never share real secrets over chat.
- **Zero-Leak Secret Masking:** Server-side cryptographic masking ensuring raw secrets are **never sent to the browser**.

### D. Environment Manager & Diff
- **Side-by-Side Comparison:** Compare any two environments (`.env.development`, `.env.staging`, `.env.production`, `.env.example`).
- **Visual Diff Table:** Clearly highlights keys that exist only in Environment A, only in Environment B, or have value differences.
- **Export & Fast Copy:** One-click copying of sanitized blueprints for CI/CD pipelines or team members.

### E. Interactive CLI Playground
- **Real Child Process Terminal:** Executes the genuine CLI binary (`src/cli.js`) via Node.js `child_process.execFile`.
- **Supported CLI Commands:**
  - `npx @sauravvbh/env-guard-cli --check` (or `env-guard-cli --check`)
  - `npx @sauravvbh/env-guard-cli --sync` (or `env-guard-cli --sync`)
  - `npx @sauravvbh/env-guard-cli --help` (or `env-guard-cli --help`)
- **Realistic Terminal Features:** Command history (navigate with ↑ / ↓ arrow keys), execution duration in milliseconds, exit codes (`0` for success, `1` for failed check), colored stdout and stderr.
- **Scenario Switching:** Change the execution workspace on the fly to see how the CLI responds to healthy vs. broken projects.

### F. Interactive Documentation
- **Package Specifications:** Details of `@sauravvbh/env-guard-cli`.
- **JavaScript API Reference:** Complete parameter and return type documentation for `findFiles`, `scanVariables`, `parseEnvFile`, `checkEnv`, and `syncEnv`.
- **Code Snippets:** Copyable Node.js integration examples.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, React 18, JavaScript (ES Modules, Vite) |
| **Styling** | Pure custom CSS (No Tailwind, No Framer Motion) |
| **Backend** | Node.js (v18+), Express 4, JavaScript (ES Modules) |
| **Core Package** | **`@sauravvbh/env-guard-cli`** (Installed and natively executed) |
| **Icons & UI** | Pure custom inline SVGs (Zero bloated icon packages) |

---

## 📁 Project Structure

```
Demo_pakage/
├── client/                      # React frontend
│   ├── public/
│   │   └── index.html           # HTML entry point with dark theme meta
│   ├── src/
│   │   ├── components/
│   │   │   ├── Badge.js         # Flexible status pills
│   │   │   ├── CodeViewer.js    # Code viewer with line numbers & copy
│   │   │   ├── Header.js        # App header & scenario switcher
│   │   │   ├── Icons.js         # Feather/Lucide vector SVG icons
│   │   │   ├── Sidebar.js       # Modern navigation sidebar
│   │   │   ├── StatCard.js      # Dashboard metric cards
│   │   │   └── Toast.js         # Notification toast system
│   │   ├── pages/
│   │   │   ├── CliPage.js       # Live sandboxed terminal playground
│   │   │   ├── DashboardPage.js # Health overview & stat cards
│   │   │   ├── DocsPage.js      # Package documentation & API guide
│   │   │   ├── ManagerPage.js   # Dual environment diff & comparison
│   │   │   ├── ScannerPage.js   # File inspector & checkEnv runner
│   │   │   └── SecurityPage.js  # Security audit & secret masking
│   │   ├── services/
│   │   │   └── api.js           # Frontend API client
│   │   ├── styles/
│   │   │   └── index.css        # Custom CSS styling (dark theme)
│   │   ├── App.js               # Main React root application
│   │   └── index.js             # React DOM bootstrap
│   ├── package.json
│   └── vite.config.js           # Vite dev server & proxy config
│
├── server/                      # Node.js Express backend
│   ├── controllers/
│   │   ├── cliController.js     # Safe child_process execution of CLI
│   │   ├── managerController.js # Multi-environment comparison
│   │   ├── scannerController.js # Integrates scanVariables & checkEnv
│   │   └── scenarioController.js# Pre-loaded realistic project scenarios
│   ├── routes/
│   │   └── api.js               # Express route definitions
│   ├── scenarios/
│   │   └── presets.js           # Sample project code & .env presets
│   ├── services/
│   │   └── envGuardService.js   # Bridge to @sauravvbh/env-guard-cli
│   ├── index.js                 # Express server & static asset server
│   └── package.json             # Server dependencies (@sauravvbh/env-guard-cli)
│
├── .gitignore                   # Ignores node_modules, dist, and .env files
├── package.json                 # Monorepo root scripts
└── README.md                    # Project documentation
```

---

## 🔌 How `@sauravvbh/env-guard-cli` is Integrated

The application uses **both** integration modes of your package:

### 1. Programmatic JavaScript API
Imported directly from `@sauravvbh/env-guard-cli` in `server/services/envGuardService.js`:
```javascript
import {
  findFiles,
  scanVariables,
  parseEnvFile,
  checkEnv,
  syncEnv
} from '@sauravvbh/env-guard-cli';
```
- `scanVariables(dir)`: Scans source files for `process.env.[VAR]` references.
- `parseEnvFile(file)`: Parses `.env` or `.env.example` into a `Set<string>`.
- `checkEnv(dir, envFile)`: Validates code variables against `.env`, logs missing/unused variables, and returns validation status.
- `syncEnv(dir, exampleFile)`: Generates template keys into `.env.example`.

### 2. Child Process CLI Execution
In `server/services/envGuardService.js`, the playground runs the actual package CLI binary:
```javascript
import { execFile } from 'node:child_process';

execFile(process.execPath, [cliPath, ...args], { cwd: workspaceDir }, (error, stdout, stderr) => {
  // Captures real stdout, stderr, exit code, and execution time
});
```
- **Strict Whitelist Protection:** Prevents arbitrary shell commands or command injection by only accepting approved CLI flags (`--check`, `--sync`, `--help`, `-h`).
- **Temporary Workspaces:** Isolates test runs into dedicated temporary directories so file operations never pollute your codebase.

---

## 🔒 Security Best Practices

1. **No Real Secrets Committed:** The `.gitignore` file strictly blocks all `.env` files while preserving `.env.example`.
2. **Server-Side Secret Sanitization:** Real values in `.env` are parsed and replaced with masked tokens (e.g., `••••••••`) before transmission to the frontend.
3. **No Arbitrary Command Execution:** The terminal interface only runs verified package commands with strict argument checking.
4. **Isolated Workspaces:** Every scan and CLI operation runs in an isolated directory.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Installation

Clone the repository and install all dependencies (root, backend, and frontend):

```bash
# Install root, server, and client dependencies
npm run install:all
```

---

## 💻 Running the Application

### Option A: Development Mode (Hot Reloading)

Run both the Express backend (port 5001) and Vite frontend (port 3000) concurrently:

```bash
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5001](http://localhost:5001)

### Option B: Standalone Servers

You can also run the backend and frontend in separate terminal tabs:

```bash
# Tab 1: Start Express backend
npm run dev:server

# Tab 2: Start Vite client
npm run dev:client
```

### Option C: Production Build & Serve

Build the frontend bundle and serve everything directly through Express:

```bash
# Build the client bundle
npm run build

# Start the server (serves API + static frontend)
npm start
```
Then open [http://localhost:5001](http://localhost:5001).

---

## 🧪 Testing the Application

### 1. Test Backend API Endpoints
```bash
# Check server health
curl http://localhost:5001/health

# Fetch project scenarios
curl http://localhost:5001/api/scenarios

# Test CLI execution endpoint
curl -X POST http://localhost:5001/api/cli/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "npx @sauravvbh/env-guard-cli --help"}'
```

### 2. Test Frontend Features
1. **Dashboard:** Select different project scenarios from the top dropdown to see the health gauge and statistics change in real time.
2. **Scanner:** Click "Re-scan with Package", inspect code files with `process.env` highlighting, or upload a custom `.env` file.
3. **Security Checker:** View the audit findings and toggle the secret masking inspector.
4. **Environment Manager:** Compare Development vs. Production and view missing keys.
5. **CLI Playground:** Click quick command chips (`--check`, `--sync`, `--help`), press Enter, or type custom flags to see real output and exit codes from your package!

---

## 📜 License

MIT © [sauravvbh-dotcom](https://github.com/sauravvbh-dotcom)
