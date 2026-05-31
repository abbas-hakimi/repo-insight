import dotenv from 'dotenv';
import path from 'node:path';
import { tmpdir } from 'node:os';

dotenv.config();

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
  reposCloneDir:
    process.env.REPOS_CLONE_DIR ??
    path.join(tmpdir(), 'ai-codebase-intelligence', 'repos'),
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
};
