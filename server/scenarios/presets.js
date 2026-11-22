export const SCENARIO_PRESETS = [
  {
    id: 'missing-production-secrets',
    name: 'Production E-Commerce API (Missing Secrets)',
    badge: 'High Risk',
    badgeVariant: 'danger',
    description: 'Code references payment gateways and cloud storage, but `.env` is missing critical credentials.',
    codeFiles: [
      {
        path: 'src/server.js',
        content: `import express from 'express';
import { connectDB } from './db/connection.js';

const app = express();
const PORT = process.env.PORT || 5000;
const DB_URL = process.env.DATABASE_URL;

connectDB(DB_URL);

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
      },
      {
        path: 'src/services/payment.js',
        content: `export async function processStripePayment(amount, token) {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is undefined at runtime!');
  }
  return { status: 'success', amount };
}`
      },
      {
        path: 'src/services/storage.js',
        content: `export function uploadToS3(file) {
  const bucket = process.env.AWS_S3_BUCKET;
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  console.log(\`Uploading to S3 bucket: \${bucket}\`);
}`
      },
      {
        path: 'src/services/cache.js',
        content: `export function initRedis() {
  const redisUrl = process.env.REDIS_URL;
  const jwtSecret = process.env.JWT_SECRET;
  return { redisUrl, jwtSecret };
}`
      }
    ],
    envContent: `# Core Server Config
PORT=5000
DATABASE_URL=postgresql://postgres:sample_secret_pw@localhost:5432/ecommerce_db
`,
    exampleContent: `# Environment Configuration Template
PORT=5000
DATABASE_URL=
`
  },
  {
    id: 'healthy-auth-service',
    name: 'Secure Auth Microservice (Fully Synced)',
    badge: 'Healthy',
    badgeVariant: 'success',
    description: 'Clean microservice architecture where all environment variables are properly defined and documented.',
    codeFiles: [
      {
        path: 'src/index.js',
        content: `import express from 'express';

const app = express();
const port = process.env.PORT || 4000;
const env = process.env.NODE_ENV;
const dbUri = process.env.MONGODB_URI;
const corsOrigin = process.env.CORS_ORIGIN;

console.log(\`Running in \${env} on port \${port}\`);`
      },
      {
        path: 'src/auth/jwt.js',
        content: `export function signTokens(user) {
  const accessSecret = process.env.ACCESS_TOKEN_SECRET;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET;
  return { accessSecret, refreshSecret };
}`
      }
    ],
    envContent: `# Auth Microservice Environment
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb+srv://admin:masked_pass@cluster.mongodb.net/auth_db
ACCESS_TOKEN_SECRET=8f9a2b4c6e1d3f5a7c9b2d4e6f8a0b2c4e6d8f0a
REFRESH_TOKEN_SECRET=1a3b5c7d9e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b
CORS_ORIGIN=http://localhost:3000
`,
    exampleContent: `# Auth Microservice Template
PORT=
NODE_ENV=
MONGODB_URI=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
CORS_ORIGIN=
`
  },
  {
    id: 'legacy-bloat-service',
    name: 'Legacy Monolith (Unused Variables)',
    badge: 'Bloat Warning',
    badgeVariant: 'warning',
    description: 'The `.env` file contains obsolete credentials from migrated services, creating unnecessary security risk.',
    codeFiles: [
      {
        path: 'src/app.js',
        content: `const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;
const DB = process.env.DATABASE_URL;
const API_KEY = process.env.API_KEY;

app.get('/health', (req, res) => res.json({ status: 'ok' }));`
      }
    ],
    envContent: `# Active variables
PORT=8080
DATABASE_URL=mysql://root:pass@localhost:3306/legacy_db
API_KEY=live_pk_test_sample_12345

# Deprecated/Dead credentials that should be pruned
OLD_MONGO_URL=mongodb://old-cluster.internal:27017/old_db
DEPRECATED_SENDGRID_KEY=mock_sendgrid_old_sample_token
UNUSED_ELASTICSEARCH_HOST=http://elastic.old-host.local:9200
TEMP_DEBUG_TOKEN=temp_token_from_2023_hackathon
`
  },
  {
    id: 'desynced-example-template',
    name: 'AI SaaS Platform (Out-of-Sync Template)',
    badge: 'Needs Sync',
    badgeVariant: 'info',
    description: 'AI integrations were implemented in code and `.env`, but `.env.example` was never updated for onboarding devs.',
    codeFiles: [
      {
        path: 'src/server.js',
        content: `const port = process.env.PORT;
const dbUrl = process.env.DATABASE_URL;`
      },
      {
        path: 'src/ai/openai.js',
        content: `export const openAiKey = process.env.OPENAI_API_KEY;
export const model = process.env.AI_MODEL_NAME;`
      },
      {
        path: 'src/ai/anthropic.js',
        content: `export const anthropicKey = process.env.ANTHROPIC_API_KEY;`
      },
      {
        path: 'src/monitoring.js',
        content: `export const sentryDsn = process.env.SENTRY_DSN;`
      }
    ],
    envContent: `PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/ai_saas
OPENAI_API_KEY=mock_openai_api_sample_token_12345
AI_MODEL_NAME=gpt-4o
ANTHROPIC_API_KEY=mock_anthropic_api_sample_token_67890
SENTRY_DSN=https://samplekey@sentry.io/123456
`,
    exampleContent: `# Only legacy vars documented
PORT=
DATABASE_URL=
`
  }
];
