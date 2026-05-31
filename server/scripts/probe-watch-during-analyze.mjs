/**
 * One-shot: watch server/src while running full analyzeRepository (reuse clone).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { analyzeRepository } from '../src/services/repository.service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(__dirname, '..');
const watchRoot = path.join(serverRoot, 'src');

dotenv.config({ path: path.join(serverRoot, '.env') });

const events = [];
const watcher = fs.watch(watchRoot, { recursive: true }, (eventType, filename) => {
  const line = `${new Date().toISOString()} ${eventType} ${filename ?? ''}`;
  events.push(line);
  console.log('[probe-watch]', line);
});

console.log('[probe] watchRoot:', watchRoot);
console.log('[probe] full analyze start');

const result = await analyzeRepository('https://github.com/facebook/react');
watcher.close();

console.log('[probe] analyze end', result.owner, result.repositoryName);
console.log('[probe] fs events under server/src:', events.length);
if (events.length) {
  console.log(events.join('\n'));
}
