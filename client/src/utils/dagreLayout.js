import dagre from '@dagrejs/dagre';

export const FILE_NODE_WIDTH = 200;
export const FILE_NODE_HEIGHT = 64;

/**
 * Apply Dagre hierarchical layout (top-to-bottom).
 */
export function applyDagreLayout(nodes, edges, direction = 'TB') {
  if (nodes.length === 0) {
    return nodes;
  }

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: direction,
    nodesep: 70,
    ranksep: 90,
    marginx: 24,
    marginy: 24,
  });

  nodes.forEach((node) => {
    graph.setNode(node.id, { width: FILE_NODE_WIDTH, height: FILE_NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    graph.setEdge(edge.source, edge.target);
  });

  dagre.layout(graph);

  return nodes.map((node) => {
    const layoutNode = graph.node(node.id);
    return {
      ...node,
      position: {
        x: layoutNode.x - FILE_NODE_WIDTH / 2,
        y: layoutNode.y - FILE_NODE_HEIGHT / 2,
      },
    };
  });
}
