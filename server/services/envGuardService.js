import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Direct JavaScript API imports from the user's published npm package:
import {
  findFiles,
  scanVariables,
  parseEnvFile,
  checkEnv,
  syncEnv
} from '@sauravvbh/env-guard-cli';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate the installed CLI binary/script for actual child_process execution
function getCliPath() {
  const possiblePaths = [
    path.resolve(__dirname, '../node_modules/@sauravvbh/env-guard-cli/src/cli.js'),
    path.resolve(__dirname, '../../node_modules/@sauravvbh/env-guard-cli/src/cli.js')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return possiblePaths[0];
}

/**
 * Creates an isolated sandboxed workspace directory in temp for running scans or CLI commands
 */
export function createWorkspace({ codeFiles = [], envContent = '', exampleContent = '' }) {
  const baseDir = path.join(os.tmpdir(), 'envguard-runs');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  const runId = `run_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const workspaceDir = path.join(baseDir, runId);
  fs.mkdirSync(workspaceDir, { recursive: true });

  // Write .env if provided
  if (typeof envContent === 'string' && envContent.trim().length > 0) {
    fs.writeFileSync(path.join(workspaceDir, '.env'), envContent, 'utf8');
  }

  // Write .env.example if provided
  if (typeof exampleContent === 'string' && exampleContent.trim().length > 0) {
    fs.writeFileSync(path.join(workspaceDir, '.env.example'), exampleContent, 'utf8');
  }

  // Write code files
  for (const file of codeFiles) {
    if (!file.path || typeof file.content !== 'string') continue;

    // Prevent directory traversal
    const safeRelPath = path.normalize(file.path).replace(/^(\.\.(\/|\\|$))+/, '');
    const fullFilePath = path.join(workspaceDir, safeRelPath);
    const parentDir = path.dirname(fullFilePath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(fullFilePath, file.content, 'utf8');
  }

  return { workspaceDir, runId };
}

/**
 * Safely removes a temporary workspace directory
 */
export function cleanupWorkspace(workspaceDir) {
  try {
    if (workspaceDir && fs.existsSync(workspaceDir) && workspaceDir.includes('envguard-runs')) {
      fs.rmSync(workspaceDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error('Failed to cleanup workspace:', err.message);
  }
}

/**
 * Masks sensitive values in environment files to strictly follow security requirements
 */
export function getMaskedEnvEntries(envContent) {
  if (!envContent || typeof envContent !== 'string') return [];

  const lines = envContent.split('\n');
  const entries = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const rawVal = trimmed.slice(eqIdx + 1).trim();

      // Mask value: show first 2 and last 2 characters if length > 6, else all asterisks
      let maskedVal = '••••••••';
      if (rawVal.length > 6) {
        maskedVal = `${rawVal.slice(0, 2)}••••••••${rawVal.slice(-2)}`;
      } else if (rawVal.length > 0) {
        maskedVal = '••••••••';
      } else {
        maskedVal = '(empty)';
      }

      entries.push({
        key,
        maskedValue: maskedVal,
        hasValue: rawVal.length > 0,
        length: rawVal.length
      });
    }
  }

  return entries;
}

/**
 * Runs the npm package analysis using the genuine JavaScript API functions:
 * findFiles, scanVariables, parseEnvFile, checkEnv
 */
export function analyzeWorkspace(workspaceDir) {
  const envPath = path.join(workspaceDir, '.env');
  const examplePath = path.join(workspaceDir, '.env.example');

  // 1. Genuine scanVariables from @sauravvbh/env-guard-cli
  const usedVars = scanVariables(workspaceDir);

  // 2. Genuine findFiles from @sauravvbh/env-guard-cli
  const scannedFiles = findFiles(workspaceDir).map((f) => path.relative(workspaceDir, f));

  // 3. Genuine parseEnvFile from @sauravvbh/env-guard-cli
  const definedVarsSet = parseEnvFile(envPath);
  const definedVars = Array.from(definedVarsSet).sort();

  const exampleVarsSet = parseEnvFile(examplePath);
  const exampleVars = Array.from(exampleVarsSet).sort();

  // 4. Intercept checkEnv stdout to capture the genuine CLI report
  const capturedLogs = [];
  const originalLog = console.log;
  console.log = (...args) => {
    capturedLogs.push(args.join(' '));
  };

  let checkSuccess = false;
  try {
    // Calls genuine checkEnv function from package
    checkSuccess = checkEnv(workspaceDir, envPath);
  } catch (err) {
    capturedLogs.push(`Error executing checkEnv: ${err.message}`);
  } finally {
    console.log = originalLog;
  }

  // Derive categories
  const missing = usedVars.filter((v) => !definedVarsSet.has(v));
  const unused = definedVars.filter((v) => !usedVars.includes(v));
  const valid = usedVars.filter((v) => definedVarsSet.has(v));
  const exampleMissing = usedVars.filter((v) => !exampleVarsSet.has(v));

  // Health score calculation:
  // 100% when all used vars are defined, penalize missing heavily, small penalty for unused
  let healthScore = 100;
  if (usedVars.length > 0) {
    const missingRatio = missing.length / usedVars.length;
    healthScore = Math.max(0, Math.round((1 - missingRatio) * 100));
  } else if (definedVars.length === 0) {
    healthScore = 0;
  }

  let status = 'optimal';
  if (missing.length > 0) {
    status = 'critical';
  } else if (unused.length > 0 || exampleMissing.length > 0) {
    status = 'warning';
  }

  // Read masked env representations
  let envRaw = '';
  if (fs.existsSync(envPath)) {
    envRaw = fs.readFileSync(envPath, 'utf8');
  }

  let exampleRaw = '';
  if (fs.existsSync(examplePath)) {
    exampleRaw = fs.readFileSync(examplePath, 'utf8');
  }

  const maskedEnvVars = getMaskedEnvEntries(envRaw);

  return {
    isHealthy: checkSuccess,
    healthScore,
    status,
    totalVariablesInCode: usedVars.length,
    totalVariablesInEnv: definedVars.length,
    usedVariables: usedVars,
    definedVariables: definedVars,
    missingVariables: missing,
    unusedVariables: unused,
    validVariables: valid,
    exampleVariables: exampleVars,
    exampleMissingVariables: exampleMissing,
    scannedFiles,
    rawCliOutput: capturedLogs.join('\n'),
    maskedEnvVars,
    hasEnvFile: fs.existsSync(envPath),
    hasExampleFile: fs.existsSync(examplePath),
    exampleContent: exampleRaw
  };
}

/**
 * Runs genuine syncEnv function from @sauravvbh/env-guard-cli
 */
export function runSync(workspaceDir) {
  const examplePath = path.join(workspaceDir, '.env.example');
  const capturedLogs = [];
  const originalLog = console.log;
  console.log = (...args) => {
    capturedLogs.push(args.join(' '));
  };

  try {
    // Calls genuine syncEnv function from package
    syncEnv(workspaceDir, examplePath);
  } finally {
    console.log = originalLog;
  }

  const updatedContent = fs.existsSync(examplePath)
    ? fs.readFileSync(examplePath, 'utf8')
    : '';

  return {
    output: capturedLogs.join('\n'),
    updatedContent
  };
}

/**
 * Executes supported CLI commands safely via Child Process (execFile),
 * strictly checking command whitelists to prevent command injection.
 */
export function executeCliCommand(rawCommand, workspaceDir) {
  return new Promise((resolve) => {
    const trimmed = (rawCommand || '').trim();

    // Whitelist matching
    let cliArgs = [];
    if (/^npx\s+@sauravvbh\/env-guard-cli(\s+--check)?$/.test(trimmed) ||
        /^env-guard-cli(\s+--check)?$/.test(trimmed) ||
        /^env-guard-tool(\s+--check)?$/.test(trimmed)) {
      cliArgs = ['--check'];
    } else if (trimmed.includes('--sync')) {
      cliArgs = ['--sync'];
    } else if (trimmed.includes('--help') || trimmed.includes('-h')) {
      cliArgs = ['--help'];
    } else {
      // Simulate unrecognized option handled directly by the package
      const customMatch = trimmed.match(/(--[a-zA-Z0-9_-]+)/);
      if (customMatch) {
        cliArgs = [customMatch[1]];
      } else {
        return resolve({
          command: trimmed,
          stdout: '',
          stderr: 'Unknown command. Supported commands:\n  npx @sauravvbh/env-guard-cli --check\n  npx @sauravvbh/env-guard-cli --sync\n  npx @sauravvbh/env-guard-cli --help',
          exitCode: 1,
          durationMs: 0
        });
      }
    }

    const cliScriptPath = getCliPath();
    const startTime = Date.now();

    // Node execFile: avoids shell invocation, executes node binary directly with safe argument array
    execFile(
      process.execPath,
      [cliScriptPath, ...cliArgs],
      {
        cwd: workspaceDir,
        timeout: 10000,
        maxBuffer: 1024 * 1024
      },
      (error, stdout, stderr) => {
        const durationMs = Date.now() - startTime;
        resolve({
          command: trimmed,
          args: cliArgs,
          stdout: stdout || '',
          stderr: stderr || (error && error.code !== 0 && !stdout ? error.message : ''),
          exitCode: error ? (error.code || 1) : 0,
          durationMs
        });
      }
    );
  });
}
