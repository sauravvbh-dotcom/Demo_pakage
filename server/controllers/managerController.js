import { getMaskedEnvEntries } from '../services/envGuardService.js';

export const SAMPLE_ENVIRONMENTS = {
  development: `# Development Environment (.env.development)
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://dev_user:local_dev_pass_123@localhost:5432/myapp_dev
REDIS_URL=redis://127.0.0.1:6379
JWT_SECRET=super_secret_jwt_dev_key_do_not_use_in_prod_998877
API_KEY=test_pk_live_dev_mode_token
DEBUG_MODE=true
LOG_LEVEL=debug
CORS_ORIGIN=http://localhost:3000
`,
  production: `# Production Environment (.env.production)
PORT=8080
NODE_ENV=production
DATABASE_URL=postgresql://db_prod_admin:pr0d_Str0ng_P@ssw0rd!#@aurora-cluster.prod.aws.com:5432/myapp_prod
REDIS_URL=rediss://prod-cache.elasticache.amazonaws.com:6379
JWT_SECRET=prod_ultra_secure_entropy_key_77a9b8c3d2e1f409581a6c8e3f92b
STRIPE_SECRET_KEY=mock_stripe_key_sample_abcdef1234567890
STRIPE_WEBHOOK_SECRET=mock_webhook_secret_sample_abcdef12345
AWS_S3_BUCKET=my-production-storage-bucket
AWS_ACCESS_KEY_ID=mock_aws_access_key_sample_id
AWS_SECRET_ACCESS_KEY=mock_aws_secret_access_key_sample_val
SENTRY_DSN=https://abc123prod@sentry.io/998877
LOG_LEVEL=info
CORS_ORIGIN=https://app.example.com
`,
  staging: `# Staging Environment (.env.staging)
PORT=4000
NODE_ENV=staging
DATABASE_URL=postgresql://stage_user:stage_password_secure@staging-db.internal:5432/myapp_stage
REDIS_URL=redis://staging-cache.internal:6379
JWT_SECRET=staging_secret_key_verification_334455
API_KEY=test_pk_staging_token_1122
LOG_LEVEL=verbose
CORS_ORIGIN=https://staging.example.com
`,
  example: `# Environment Example Template (.env.example)
PORT=
NODE_ENV=
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
AWS_S3_BUCKET=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
SENTRY_DSN=
LOG_LEVEL=
CORS_ORIGIN=
`
};

export function getSampleEnvironments(req, res) {
  try {
    return res.json({
      success: true,
      environments: {
        development: SAMPLE_ENVIRONMENTS.development,
        production: SAMPLE_ENVIRONMENTS.production,
        staging: SAMPLE_ENVIRONMENTS.staging,
        example: SAMPLE_ENVIRONMENTS.example
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function compareEnvironments(req, res) {
  try {
    const { envA = '', envB = '', labelA = 'Environment A', labelB = 'Environment B' } = req.body;

    const entriesA = getMaskedEnvEntries(envA);
    const entriesB = getMaskedEnvEntries(envB);

    const keysA = new Set(entriesA.map((e) => e.key));
    const keysB = new Set(entriesB.map((e) => e.key));

    const allKeys = Array.from(new Set([...keysA, ...keysB])).sort();

    const comparisonRows = allKeys.map((key) => {
      const itemA = entriesA.find((e) => e.key === key);
      const itemB = entriesB.find((e) => e.key === key);

      let status = 'synced'; // present in both
      if (itemA && !itemB) {
        status = 'only_in_a';
      } else if (!itemA && itemB) {
        status = 'only_in_b';
      } else if (itemA && itemB && itemA.maskedValue !== itemB.maskedValue) {
        status = 'different_values';
      }

      return {
        key,
        status,
        inA: !!itemA,
        inB: !!itemB,
        valA: itemA ? itemA.maskedValue : '—',
        valB: itemB ? itemB.maskedValue : '—',
        lengthA: itemA ? itemA.length : 0,
        lengthB: itemB ? itemB.length : 0
      };
    });

    const summary = {
      totalKeysCombined: allKeys.length,
      keysInA: keysA.size,
      keysInB: keysB.size,
      onlyInA: comparisonRows.filter((r) => r.status === 'only_in_a').length,
      onlyInB: comparisonRows.filter((r) => r.status === 'only_in_b').length,
      sharedKeys: comparisonRows.filter((r) => r.inA && r.inB).length
    };

    return res.json({
      success: true,
      labelA,
      labelB,
      summary,
      rows: comparisonRows
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function getPackageInfo(req, res) {
  return res.json({
    success: true,
    package: {
      name: '@sauravvbh/env-guard-cli',
      version: '1.0.0',
      description: 'A simple CLI tool to scan and check environment variables in your project.',
      author: 'sauravvbh-dotcom',
      license: 'MIT',
      repositoryUrl: 'https://github.com/sauravvbh-dotcom/npm_pakage',
      npmUrl: 'https://www.npmjs.com/package/@sauravvbh/env-guard-cli',
      exports: [
        {
          name: 'findFiles',
          params: '(dir = ".")',
          returns: 'Array<string>',
          description: 'Recursively scans directory for supported code files (.js, .mjs, .cjs, .jsx, .ts, .tsx), ignoring node_modules, .git, dist, build.'
        },
        {
          name: 'scanVariables',
          params: '(dir = ".")',
          returns: 'Array<string>',
          description: 'Scans source files using regex /process\\.env\\.([A-Za-z0-9_]+)/g and returns unique sorted variable names.'
        },
        {
          name: 'parseEnvFile',
          params: '(filePath = ".env")',
          returns: 'Set<string>',
          description: 'Parses .env file, ignoring comments and blank lines, returning a Set of defined variable keys.'
        },
        {
          name: 'checkEnv',
          params: '(dir = ".", envFile = ".env")',
          returns: 'boolean',
          description: 'Compares variables used in code against defined vars in .env, prints missing and unused lists, returns true if missing.length === 0.'
        },
        {
          name: 'syncEnv',
          params: '(dir = ".", exampleFile = ".env.example")',
          returns: 'void',
          description: 'Finds variables used in code that are missing in .env.example, and appends them with empty values (KEY=).'
        }
      ],
      cliCommands: [
        {
          command: 'npx @sauravvbh/env-guard-cli --check',
          description: 'Check if variables in code exist in .env (default command).'
        },
        {
          command: 'npx @sauravvbh/env-guard-cli --sync',
          description: 'Generate or update .env.example with missing variables.'
        },
        {
          command: 'npx @sauravvbh/env-guard-cli --help',
          description: 'Show CLI usage instructions and options.'
        }
      ]
    }
  });
}
