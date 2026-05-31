import { access, mkdir, rm } from 'fs/promises';
import path from 'node:path';
import simpleGit from 'simple-git';
import { env } from '../config/env.js';
import { parseGitHubUrl } from '../utils/githubUrl.js';
import { HttpError } from '../utils/httpError.js';
import { analyzeRepositoryContents } from './repositoryStats.service.js';
import { buildRepositoryFileTree } from './repositoryTree.service.js';
import { buildRepositoryDependencyGraph } from './repositoryDependencyGraph.service.js';

function logPhase(label, startMs, detail = '') {
  const durationMs = Math.round(performance.now() - startMs);
  console.log(`[analyze] ${label} end ${durationMs}ms${detail ? ` ${detail}` : ''}`);
}

async function timedPhase(label, fn) {
  const start = performance.now();
  console.log(`[analyze] ${label} start`);
  const result = await fn();
  logPhase(label, start);
  return result;
}

/**
 * Deterministic on-disk path: one folder per owner/repo under REPOS_CLONE_DIR.
 */
function getLocalRepoPath(owner, repo) {
  const safeSegment = (value) => value.replace(/[^a-zA-Z0-9._-]/g, '_');
  return path.join(env.reposCloneDir, `${safeSegment(owner)}-${safeSegment(repo)}`);
}

async function isClonedRepository(dirPath) {
  try {
    await access(path.join(dirPath, '.git'));
    return await simpleGit(dirPath).checkIsRepo();
  } catch {
    return false;
  }
}

async function cloneRepository(cloneUrl, localPath) {
  console.log(`[repository] Clone base directory: ${env.reposCloneDir}`);
  console.log(`[repository] Clone target path: ${localPath}`);

  await mkdir(env.reposCloneDir, { recursive: true });

  try {
    await simpleGit({ config: ['core.longpaths=true'] }).clone(cloneUrl, localPath, [
      '--depth',
      '1',
    ]);
  } catch (err) {
    await rm(localPath, { recursive: true, force: true }).catch(() => {});
    const message = err?.message ?? 'Failed to clone repository';
    throw new HttpError(
      502,
      /not found/i.test(message)
        ? 'Repository not found or is not accessible'
        : `Clone failed: ${message}`,
    );
  }
}

/**
 * Repository analysis V5 — clone, statistics, file tree, and dependency graph.
 */
export async function analyzeRepository(githubUrl) {
  const totalStart = performance.now();
  console.log(`[analyze] request start ${githubUrl}`);

  const { owner, repo, cloneUrl } = parseGitHubUrl(githubUrl);
  const localPath = getLocalRepoPath(owner, repo);

  await timedPhase('cloneRepository', async () => {
    if (!(await isClonedRepository(localPath))) {
      await rm(localPath, { recursive: true, force: true }).catch(() => {});
      await cloneRepository(cloneUrl, localPath);
      return 'cloned';
    }
    return 'reused existing clone';
  });

  const resolvedPath = path.resolve(localPath);
  const [statistics, { fileTree, fileTreeMeta }, { dependencyGraph, graphMeta }] =
    await Promise.all([
      timedPhase('repository statistics', () => analyzeRepositoryContents(resolvedPath)),
      timedPhase('file tree generation', () => buildRepositoryFileTree(resolvedPath)),
      timedPhase('dependency graph generation', () =>
        buildRepositoryDependencyGraph(resolvedPath),
      ),
    ]);

  logPhase('total', totalStart);
  console.log(`[analyze] request end ${owner}/${repo}`);

  return {
    owner,
    repositoryName: repo,
    localPath: resolvedPath,
    statistics,
    fileTree,
    fileTreeMeta,
    dependencyGraph,
    graphMeta,
  };
}
