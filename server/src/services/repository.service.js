import { access, mkdir, rm } from 'fs/promises';
import path from 'node:path';
import simpleGit from 'simple-git';
import { env } from '../config/env.js';
import { parseGitHubUrl } from '../utils/githubUrl.js';
import { HttpError } from '../utils/httpError.js';
import { analyzeRepositoryContents } from './repositoryStats.service.js';
import { buildRepositoryFileTree } from './repositoryTree.service.js';

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
 * Repository analysis V4 — clone, statistics, and hierarchical file tree.
 */
export async function analyzeRepository(githubUrl) {
  const { owner, repo, cloneUrl } = parseGitHubUrl(githubUrl);
  const localPath = getLocalRepoPath(owner, repo);

  if (!(await isClonedRepository(localPath))) {
    await rm(localPath, { recursive: true, force: true }).catch(() => {});
    await cloneRepository(cloneUrl, localPath);
  }

  const resolvedPath = path.resolve(localPath);
  const [statistics, { fileTree, fileTreeMeta }] = await Promise.all([
    analyzeRepositoryContents(resolvedPath),
    buildRepositoryFileTree(resolvedPath),
  ]);

  return {
    owner,
    repositoryName: repo,
    localPath: resolvedPath,
    statistics,
    fileTree,
    fileTreeMeta,
  };
}
