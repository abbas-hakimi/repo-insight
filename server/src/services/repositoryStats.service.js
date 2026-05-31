import { readdir } from 'fs/promises';
import path from 'node:path';
import { IGNORED_REPOSITORY_DIRS } from '../constants/repositoryIgnore.js';
import { HttpError } from '../utils/httpError.js';

/**
 * Recursively scan a cloned repository and aggregate file/folder statistics.
 */
export async function analyzeRepositoryContents(rootPath) {
  const resolvedRoot = path.resolve(rootPath);
  const extensions = {};
  let totalFiles = 0;
  let totalFolders = 0;

  const queue = [resolvedRoot];

  while (queue.length > 0) {
    const currentDir = queue.shift();
    let entries;

    try {
      entries = await readdir(currentDir, { withFileTypes: true });
    } catch (err) {
      throw new HttpError(500, `Failed to read directory: ${currentDir}`);
    }

    for (const entry of entries) {
      if (entry.isSymbolicLink()) {
        continue;
      }

      const entryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (IGNORED_REPOSITORY_DIRS.has(entry.name)) {
          continue;
        }
        totalFolders += 1;
        queue.push(entryPath);
        continue;
      }

      if (entry.isFile()) {
        totalFiles += 1;
        const ext = path.extname(entry.name).toLowerCase();
        extensions[ext] = (extensions[ext] ?? 0) + 1;
      }
    }
  }

  return {
    totalFiles,
    totalFolders,
    extensions: sortExtensionKeys(extensions),
  };
}

function sortExtensionKeys(extensions) {
  return Object.keys(extensions)
    .sort((a, b) => a.localeCompare(b))
    .reduce((sorted, key) => {
      sorted[key] = extensions[key];
      return sorted;
    }, {});
}
