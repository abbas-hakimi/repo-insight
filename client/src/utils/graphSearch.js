import { matchesFilenameFilter } from './dependencyGraphMapper.js';

/**
 * Expand search to matching nodes plus direct incoming/outgoing neighbors and connecting edges.
 */
export function computeSearchHighlight(initialNodes, initialEdges, searchQuery) {
  if (!searchQuery.trim()) {
    return {
      filterActive: false,
      matchIds: new Set(),
      incomingIds: new Set(),
      outgoingIds: new Set(),
      visibleNodeIds: new Set(initialNodes.map((node) => node.id)),
      visibleEdgeIds: new Set(initialEdges.map((edge) => edge.id)),
    };
  }

  const matchIds = new Set(
    initialNodes
      .filter((node) => matchesFilenameFilter(node, searchQuery))
      .map((node) => node.id),
  );

  const incomingIds = new Set();
  const outgoingIds = new Set();
  const visibleEdgeIds = new Set();

  for (const edge of initialEdges) {
    if (matchIds.has(edge.target) && !matchIds.has(edge.source)) {
      incomingIds.add(edge.source);
    }
    if (matchIds.has(edge.source) && !matchIds.has(edge.target)) {
      outgoingIds.add(edge.target);
    }
  }

  const visibleNodeIds = new Set([...matchIds, ...incomingIds, ...outgoingIds]);

  for (const edge of initialEdges) {
    if (visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)) {
      visibleEdgeIds.add(edge.id);
    }
  }

  return {
    filterActive: true,
    matchIds,
    incomingIds,
    outgoingIds,
    visibleNodeIds,
    visibleEdgeIds,
  };
}

export function getNodeHighlightRole(nodeId, { matchIds, incomingIds, outgoingIds }) {
  if (matchIds.has(nodeId)) {
    return 'match';
  }
  if (incomingIds.has(nodeId)) {
    return 'incoming';
  }
  if (outgoingIds.has(nodeId)) {
    return 'outgoing';
  }
  return null;
}
