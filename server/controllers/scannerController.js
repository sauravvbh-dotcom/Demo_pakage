import { SCENARIO_PRESETS } from '../scenarios/presets.js';
import {
  createWorkspace,
  cleanupWorkspace,
  analyzeWorkspace,
  runSync
} from '../services/envGuardService.js';

export function handleScan(req, res) {
  let workspaceDir = null;
  try {
    const { scenarioId, codeFiles, envContent, exampleContent } = req.body;

    let targetCode = codeFiles;
    let targetEnv = envContent;
    let targetExample = exampleContent;

    if (scenarioId) {
      const preset = SCENARIO_PRESETS.find((p) => p.id === scenarioId);
      if (preset) {
        targetCode = preset.codeFiles;
        targetEnv = preset.envContent;
        targetExample = preset.exampleContent || '';
      }
    }

    if (!Array.isArray(targetCode) || targetCode.length === 0) {
      targetCode = [
        {
          path: 'src/index.js',
          content: 'const port = process.env.PORT;\nconst db = process.env.DATABASE_URL;'
        }
      ];
    }

    if (typeof targetEnv !== 'string') {
      targetEnv = 'PORT=3000\n';
    }

    const ws = createWorkspace({
      codeFiles: targetCode,
      envContent: targetEnv,
      exampleContent: targetExample
    });
    workspaceDir = ws.workspaceDir;

    const analysis = analyzeWorkspace(workspaceDir);

    // Build intelligent, contextual security suggestions
    const suggestions = [];
    if (analysis.missingVariables.length > 0) {
      suggestions.push({
        type: 'danger',
        title: 'Missing Required Variables',
        message: `${analysis.missingVariables.length} variable(s) referenced in source code are missing in .env (${analysis.missingVariables.join(', ')}). In production, referencing undefined variables will cause runtime crashes.`,
        action: 'Add missing keys to your .env file or provide default fallbacks in code.'
      });
    }

    if (analysis.unusedVariables.length > 0) {
      suggestions.push({
        type: 'warning',
        title: 'Unused / Obsolete Credentials',
        message: `${analysis.unusedVariables.length} variable(s) in .env are not referenced anywhere in your source code (${analysis.unusedVariables.join(', ')}).`,
        action: 'Remove obsolete keys to reduce credential footprint and prevent credential leaks.'
      });
    }

    if (analysis.exampleMissingVariables.length > 0) {
      suggestions.push({
        type: 'info',
        title: '.env.example Out of Sync',
        message: `${analysis.exampleMissingVariables.length} variable(s) used in code are missing from .env.example. Team members cloning this repo may experience onboarding failures.`,
        action: 'Run "npx @sauravvbh/env-guard-cli --sync" to automatically populate .env.example with empty keys.'
      });
    }

    if (analysis.isHealthy && analysis.unusedVariables.length === 0 && analysis.exampleMissingVariables.length === 0) {
      suggestions.push({
        type: 'success',
        title: '100% Environment Health',
        message: 'All environment variables in code are mapped, no dead keys exist, and templates are up to date.',
        action: 'No action required. Your environment configuration is fully secure.'
      });
    }

    cleanupWorkspace(workspaceDir);

    return res.json({
      success: true,
      analysis: {
        ...analysis,
        suggestions
      }
    });
  } catch (err) {
    if (workspaceDir) cleanupWorkspace(workspaceDir);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function handleSync(req, res) {
  let workspaceDir = null;
  try {
    const { scenarioId, codeFiles, envContent, exampleContent } = req.body;

    let targetCode = codeFiles;
    let targetEnv = envContent;
    let targetExample = exampleContent;

    if (scenarioId) {
      const preset = SCENARIO_PRESETS.find((p) => p.id === scenarioId);
      if (preset) {
        targetCode = preset.codeFiles;
        targetEnv = preset.envContent;
        targetExample = preset.exampleContent || '';
      }
    }

    const ws = createWorkspace({
      codeFiles: targetCode,
      envContent: targetEnv,
      exampleContent: targetExample
    });
    workspaceDir = ws.workspaceDir;

    const syncResult = runSync(workspaceDir);

    cleanupWorkspace(workspaceDir);

    return res.json({
      success: true,
      output: syncResult.output,
      updatedContent: syncResult.updatedContent
    });
  } catch (err) {
    if (workspaceDir) cleanupWorkspace(workspaceDir);
    return res.status(500).json({ success: false, error: err.message });
  }
}
