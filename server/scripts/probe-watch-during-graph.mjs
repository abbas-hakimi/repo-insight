/**
 * One-shot: watch server/src while running dependency graph on a clone (no HTTP).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { buildRepositoryDependencyGraph } from '../src/services/repositoryDependencyGraph.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');
const watchRoot = path.join(serverRoot, 'src');

dotenv.config({ path: path.join(serverRoot, '.env') });

const cloneCandidates = [
  process.env.REPOS_CLONE_DIR?.trim(),
  path.join(process.env.TEMP || 'C:\\Windows\\Temp', 'ai-codebase-intelligence', 'repos', 'facebook-react'),
  path.resolve(serverRoot, '../../repos/facebook-react'),
].filter(Boolean);

let repoRoot = null;
for (const candidate of cloneCandidates) {
  const resolved = path.resolve(candidate);
  try {
    await fs.promises.access(resolved);
    repoRoot = resolved;
    break;
  } catch {
    /* try next */
  }
}

if (!repoRoot) {
  console.error('[probe] No clone found. Set REPOS_CLONE_DIR or clone facebook/react first.');
  process.exit(1);
}

const events = [];

const watcher = fs.watch(watchRoot, { recursive: true }, (eventType, filename) => {
  const line = `${new Date().toISOString()} ${eventType} ${filename ?? ''}`;
  events.push(line);
  console.log('[probe-watch]', line);
});

console.log('[probe] watchRoot:', watchRoot);
console.log('[probe] repoRoot:', repoRoot);
console.log('[probe] dependency graph start');

const t0 = performance.now();
const result = await buildRepositoryDependencyGraph(repoRoot);
const ms = Math.round(performance.now() - t0);

watcher.close();

console.log('[probe] dependency graph end', ms, 'ms');
console.log('[probe] graphMeta edges:', result.graphMeta.edges);
console.log('[probe] fs events under server/src during run:', events.length);
if (events.length > 0) {
  console.log('[probe] events:\n', events.join('\n'));
}
