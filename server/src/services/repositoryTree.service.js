import { readdir } from 'fs/promises';
import path from 'node:path';
import { IGNORED_REPOSITORY_DIRS } from '../constants/repositoryIgnore.js';
import {
  FILE_TREE_FILE_MARKER,
  FILE_TREE_MAX_DEPTH,
  FILE_TREE_MAX_NODES,
  FILE_TREE_TRUNCATED_MARKER,
} from '../constants/repositoryTree.js';
import { HttpError } from '../utils/httpError.js';

/**
 * Build a nested JSON file tree for a cloned repository.
 *
 * Directories are nested objects; files are the string "file".
 */
export async function buildRepositoryFileTree(rootPath) {
  const resolvedRoot = path.resolve(rootPath);
  const state = {
    nodeCount: 0,
    truncated: false,
    depthLimitReached: false,
  };

  const fileTree = await buildTreeNode(resolvedRoot, 0, state);

  return {
    fileTree,
    fileTreeMeta: {
      truncated: state.truncated,
      depthLimitReached: state.depthLimitReached,
      nodesIncluded: state.nodeCount,
      maxDepth: FILE_TREE_MAX_DEPTH,
      maxNodes: FILE_TREE_MAX_NODES,
    },
  };
}

async function buildTreeNode(dirPath, depth, state) {
  if (state.nodeCount >= FILE_TREE_MAX_NODES) {
    state.truncated = true;
    return { '...': FILE_TREE_TRUNCATED_MARKER };
  }

  const tree = {};
  let entries;

  try {
    entries = await readdir(dirPath, { withFileTypes: true });
  } catch {
    throw new HttpError(500, `Failed to read directory: ${dirPath}`);
  }

  entries.sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    if (state.nodeCount >= FILE_TREE_MAX_NODES) {
      state.truncated = true;
      tree['...'] = FILE_TREE_TRUNCATED_MARKER;
      break;
    }

    if (entry.isSymbolicLink()) {
      continue;
    }

    if (entry.isDirectory() && IGNORED_REPOSITORY_DIRS.has(entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      state.nodeCount += 1;

      if (depth >= FILE_TREE_MAX_DEPTH) {
        state.depthLimitReached = true;
        state.truncated = true;
        tree[entry.name] = { '...': FILE_TREE_TRUNCATED_MARKER };
        continue;
      }

      const childPath = path.join(dirPath, entry.name);
      tree[entry.name] = await buildTreeNode(childPath, depth + 1, state);
      continue;
    }

    if (entry.isFile()) {
      state.nodeCount += 1;
      tree[entry.name] = FILE_TREE_FILE_MARKER;
    }
  }

  return tree;
}
