import { applyDagreLayout } from './dagreLayout.js';
import { getFileName, getNodeColors } from './nodePresentation.js';

export const MAX_RENDER_NODES = 100;

export function mapDependencyGraphToReactFlow(dependencyGraph) {
  const apiNodes = dependencyGraph?.nodes ?? [];
  const apiEdges = dependencyGraph?.edges ?? [];

  const renderedApiNodes = apiNodes.slice(0, MAX_RENDER_NODES);
  const renderedNodeIds = new Set(renderedApiNodes.map((node) => node.id));

  const renderedApiEdges = apiEdges.filter(
    (edge) => renderedNodeIds.has(edge.source) && renderedNodeIds.has(edge.target),
  );

  const baseNodes = renderedApiNodes.map((node) => {
    const colors = getNodeColors(node.id);
    return {
      id: node.id,
      type: 'fileNode',
      position: { x: 0, y: 0 },
      data: {
        fileName: getFileName(node.id),
        fullPath: node.id,
        colors,
        dimmed: false,
      },
    };
  });

  const baseEdges = renderedApiEdges.map((edge, index) => ({
    id: `edge-${edge.source}-${edge.target}-${index}`,
    source: edge.source,
    target: edge.target,
    animated: false,
    style: { stroke: '#94a3b8', strokeWidth: 1.5 },
  }));

  const nodes = applyDagreLayout(baseNodes, baseEdges);

  return {
    nodes,
    edges: baseEdges,
    stats: {
      totalNodes: apiNodes.length,
      totalEdges: apiEdges.length,
      renderedNodes: nodes.length,
      renderedEdges: baseEdges.length,
    },
  };
}

export function getNodeDependencies(nodeId, edges) {
  const incoming = edges.filter((edge) => edge.target === nodeId).map((edge) => edge.source);
  const outgoing = edges.filter((edge) => edge.source === nodeId).map((edge) => edge.target);
  return { incoming, outgoing };
}

export function matchesFilenameFilter(node, query) {
  if (!query.trim()) {
    return true;
  }
  return node.data.fileName.toLowerCase().includes(query.trim().toLowerCase());
}
