import { readdir, readFile } from 'fs/promises';
import path from 'node:path';
import {
  DEPENDENCY_GRAPH_EXTENSIONS,
  DEPENDENCY_GRAPH_MAX_EDGES,
  DEPENDENCY_GRAPH_MAX_NODES,
} from '../constants/repositoryDependency.js';
import { IGNORED_REPOSITORY_DIRS } from '../constants/repositoryIgnore.js';
import { parseRelativeImports } from '../utils/importParser.js';
import { resolveRelativeImport, toRepoRelativeId } from '../utils/moduleResolver.js';

/**
 * Build a file-to-file dependency graph for JS/TS modules (relative imports only).
 */
export async function buildRepositoryDependencyGraph(rootPath) {
  const repoRoot = path.resolve(rootPath);
  const allSourceFiles = await collectSourceFiles(repoRoot);
  const knownFiles = new Set(allSourceFiles);

  const nodeIds = new Set();
  const edges = [];
  let truncated = false;

  const filesToAnalyze =
    allSourceFiles.length > DEPENDENCY_GRAPH_MAX_NODES
      ? allSourceFiles.slice(0, DEPENDENCY_GRAPH_MAX_NODES)
      : allSourceFiles;

  if (allSourceFiles.length > DEPENDENCY_GRAPH_MAX_NODES) {
    truncated = true;
  }

  for (const fileId of filesToAnalyze) {
    if (!addNode(nodeIds, fileId)) {
      truncated = true;
      break;
    }

    let source;
    try {
      source = await readFile(path.join(repoRoot, fileId), 'utf8');
    } catch {
      continue;
    }

    const specifiers = parseRelativeImports(source);

    for (const specifier of specifiers) {
      if (edges.length >= DEPENDENCY_GRAPH_MAX_EDGES) {
        truncated = true;
        break;
      }

      const targetId = resolveRelativeImport(fileId, specifier, knownFiles);
      if (!targetId) {
        continue;
      }

      if (!addNode(nodeIds, targetId)) {
        truncated = true;
        continue;
      }

      edges.push({ source: fileId, target: targetId });
    }

    if (edges.length >= DEPENDENCY_GRAPH_MAX_EDGES) {
      truncated = true;
      break;
    }
  }

  const nodes = [...nodeIds]
    .sort((a, b) => a.localeCompare(b))
    .map((id) => ({ id, type: 'file' }));

  return {
    dependencyGraph: { nodes, edges },
    graphMeta: {
      nodes: nodes.length,
      edges: edges.length,
      truncated,
      maxNodes: DEPENDENCY_GRAPH_MAX_NODES,
      maxEdges: DEPENDENCY_GRAPH_MAX_EDGES,
      sourceFilesDiscovered: allSourceFiles.length,
    },
  };
}

function addNode(nodeIds, id) {
  if (nodeIds.has(id)) {
    return true;
  }
  if (nodeIds.size >= DEPENDENCY_GRAPH_MAX_NODES) {
    return false;
  }
  nodeIds.add(id);
  return true;
}

async function collectSourceFiles(repoRoot) {
  const files = [];
  const queue = [repoRoot];

  while (queue.length > 0) {
    const currentDir = queue.shift();
    let entries;

    try {
      entries = await readdir(currentDir, { withFileTypes: true });
    } catch {
      continue;
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
        queue.push(entryPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const ext = path.extname(entry.name).toLowerCase();
      if (!DEPENDENCY_GRAPH_EXTENSIONS.has(ext)) {
        continue;
      }

      files.push(toRepoRelativeId(repoRoot, entryPath));
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
}
