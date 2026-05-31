/**
 * Group file paths into folder/package clusters for layout and UI grouping.
 */

const CLUSTER_PREFIX = 'cluster:';

export function clusterNodeId(clusterKey) {
  return `${CLUSTER_PREFIX}${clusterKey}`;
}

export function isClusterNodeId(id) {
  return id.startsWith(CLUSTER_PREFIX);
}

export function clusterKeyFromNodeId(id) {
  return id.startsWith(CLUSTER_PREFIX) ? id.slice(CLUSTER_PREFIX.length) : null;
}

/**
 * Deterministic cluster key from a repo-relative file path.
 * packages/foo/src/... → packages/foo/src; other paths → parent directory.
 */
export function getClusterKey(filePath) {
  const parts = filePath.split('/').filter(Boolean);
  if (parts.length <= 1) {
    return 'root';
  }

  if (parts[0] === 'packages' && parts.length >= 3) {
    if (parts[2] === 'src') {
      return parts.slice(0, 3).join('/');
    }
    return parts.slice(0, 2).join('/');
  }

  return parts.slice(0, -1).join('/') || 'root';
}

export function getClusterLabel(clusterKey) {
  if (clusterKey === 'root') {
    return 'root';
  }
  const segments = clusterKey.split('/');
  if (segments[0] === 'packages' && segments.length >= 2) {
    return segments.slice(1).join('/') || segments[1];
  }
  return segments[segments.length - 1] || clusterKey;
}

/**
 * @param {{ id: string }[]} fileNodes
 * @returns {Map<string, { id: string }[]>}
 */
export function groupFileNodesByCluster(fileNodes) {
  const groups = new Map();

  for (const node of fileNodes) {
    const key = getClusterKey(node.id);
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(node);
  }

  return new Map([...groups.entries()].sort(([a], [b]) => a.localeCompare(b)));
}

export function buildFileToClusterMap(fileNodes) {
  const map = new Map();
  for (const node of fileNodes) {
    map.set(node.id, getClusterKey(node.id));
  }
  return map;
}
