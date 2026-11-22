import { SCENARIO_PRESETS } from '../scenarios/presets.js';
import {
  createWorkspace,
  cleanupWorkspace,
  executeCliCommand
} from '../services/envGuardService.js';

export async function handleCliExecute(req, res) {
  let workspaceDir = null;
  try {
    const { command, scenarioId, codeFiles, envContent, exampleContent } = req.body;

    if (!command || typeof command !== 'string') {
      return res.status(400).json({ success: false, error: 'Command string is required' });
    }

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

    // Executes child process against real installed package CLI
    const result = await executeCliCommand(command, workspaceDir);

    cleanupWorkspace(workspaceDir);

    return res.json({
      success: true,
      result
    });
  } catch (err) {
    if (workspaceDir) cleanupWorkspace(workspaceDir);
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getSupportedCommands(req, res) {
  const commands = [
    {
      command: 'npx @sauravvbh/env-guard-cli --check',
      alias: 'env-guard-cli --check',
      description: 'Scans source files for process.env references and verifies all variables exist in .env.',
      flags: ['--check', '(default)'],
      exitCodes: {
        '0': 'Success - All variables defined in .env',
        '1': 'Check failed - One or more variables missing in .env'
      }
    },
    {
      command: 'npx @sauravvbh/env-guard-cli --sync',
      alias: 'env-guard-cli --sync',
      description: 'Finds variables used in code and generates or appends them as empty templates in .env.example.',
      flags: ['--sync'],
      exitCodes: {
        '0': 'Success - Updated .env.example or already up to date'
      }
    },
    {
      command: 'npx @sauravvbh/env-guard-cli --help',
      alias: 'env-guard-cli --help',
      description: 'Displays the CLI usage instructions and available options.',
      flags: ['--help', '-h'],
      exitCodes: {
        '0': 'Success - Displayed help banner'
      }
    }
  ];

  return res.json({ success: true, commands });
}
