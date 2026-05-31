/**
 * Dev entry: logs every fs change under server/src (same tree as node --watch-path=./src),
 * then spawns the normal watch command. Lives outside src/ so this file is not watched.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const watchRoot = path.resolve(__dirname, 'src');
const cloneDirDefault = path.join(
  process.env.TEMP || process.env.TMP || 'C:\\Windows\\Temp',
  'ai-codebase-intelligence',
  'repos',
);

function logWatchConfig() {
  const reposFromEnv = process.env.REPOS_CLONE_DIR?.trim();
  const cloneDir = reposFromEnv ? path.resolve(reposFromEnv) : cloneDirDefault;

  console.log('[watch-log] Node watch-path (expected):', watchRoot);
  console.log('[watch-log] Clone dir (env or default):', cloneDir);
  console.log(
    '[watch-log] Clone inside watched src?:',
    isPathInside(cloneDir, watchRoot) ? 'YES — would trigger restarts' : 'no',
  );
  console.log('[watch-log] Listening for change/rename events…');
}

function isPathInside(child, parent) {
  const rel = path.relative(parent, child);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

function logFsEvent(eventType, filename) {
  const at = new Date().toISOString();
  const name = filename ? String(filename) : '(unknown)';
  const fullPath = filename ? path.join(watchRoot, name) : watchRoot;
  console.log(`[watch-log] ${at} event=${eventType} file=${name} fullPath=${fullPath}`);
}

function attachRecursiveWatch(dir) {
  try {
    const watcher = fs.watch(dir, { recursive: true }, (eventType, filename) => {
      logFsEvent(eventType, filename);
    });
    watcher.on('error', (err) => {
      console.error('[watch-log] watcher error:', err.message);
    });
  } catch (err) {
    console.error('[watch-log] failed to watch', dir, err.message);
  }
}

logWatchConfig();
attachRecursiveWatch(watchRoot);

const child = spawn(
  process.execPath,
  ['--watch-path=./src', '--watch-preserve-output', '--watch', 'src/server.js'],
  {
    cwd: __dirname,
    stdio: 'inherit',
    env: process.env,
  },
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
