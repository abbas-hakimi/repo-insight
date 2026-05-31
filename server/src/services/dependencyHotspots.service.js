const TOP_N = 10;

function getFileName(filePath) {
  const segments = filePath.split('/');
  return segments[segments.length - 1] || filePath;
}

function collectFileIds(nodes, edges) {
  const ids = new Set();
  for (const node of nodes) {
    ids.add(node.id);
  }
  for (const edge of edges) {
    ids.add(edge.source);
    ids.add(edge.target);
  }
  return ids;
}

function toRankedList(files, countKey) {
  return [...files]
    .sort((a, b) => b[countKey] - a[countKey] || a.filePath.localeCompare(b.filePath))
    .slice(0, TOP_N)
    .map((file, index) => ({
      rank: index + 1,
      filePath: file.filePath,
      fileName: file.fileName,
      count: file[countKey],
    }));
}

/**
 * Derive per-file import counts and top-N hotspot rankings from a dependency graph.
 *
 * @param {{ nodes?: { id: string }[], edges?: { source: string, target: string }[] }} dependencyGraph
 */
export function computeDependencyHotspots(dependencyGraph) {
  const nodes = dependencyGraph?.nodes ?? [];
  const edges = dependencyGraph?.edges ?? [];
  const fileIds = collectFileIds(nodes, edges);

  const incomingDependencies = new Map();
  const outgoingDependencies = new Map();

  for (const fileId of fileIds) {
    incomingDependencies.set(fileId, 0);
    outgoingDependencies.set(fileId, 0);
  }

  for (const edge of edges) {
    outgoingDependencies.set(edge.source, (outgoingDependencies.get(edge.source) ?? 0) + 1);
    incomingDependencies.set(edge.target, (incomingDependencies.get(edge.target) ?? 0) + 1);
  }

  const files = [...fileIds]
    .sort((a, b) => a.localeCompare(b))
    .map((filePath) => ({
      filePath,
      fileName: getFileName(filePath),
      incomingDependencies: incomingDependencies.get(filePath) ?? 0,
      outgoingDependencies: outgoingDependencies.get(filePath) ?? 0,
    }));

  return {
    files,
    topImported: toRankedList(files, 'incomingDependencies'),
    topImporting: toRankedList(files, 'outgoingDependencies'),
    totals: {
      filesAnalyzed: files.length,
      totalEdges: edges.length,
    },
  };
}
