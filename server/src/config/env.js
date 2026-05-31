import dotenv from 'dotenv';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../..');
/** Outside synced project tree by default — avoids OneDrive churn and watch-mode noise. */
const defaultReposCloneDir = path.join(tmpdir(), 'ai-codebase-intelligence', 'repos');

function resolveReposCloneDir() {
  const fromEnv = process.env.REPOS_CLONE_DIR?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }
  return defaultReposCloneDir;
}

const required = ['PORT'];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

const mongodbUri = process.env.MONGODB_URI?.trim() || undefined;

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT),
  mongodbUri,
  hasMongoDb: Boolean(mongodbUri),
  corsOrigin: process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()) ?? [],
  apiPrefix: process.env.API_PREFIX ?? '/api/v1',
  reposCloneDir: resolveReposCloneDir(),
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
};
