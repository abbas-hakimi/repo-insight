import dagre from '@dagrejs/dagre';
import {
  buildFileToClusterMap,
  clusterNodeId,
  getClusterLabel,
  groupFileNodesByCluster,
} from './graphClustering.js';

export const FILE_NODE_WIDTH = 200;
export const FILE_NODE_HEIGHT = 64;
const CLUSTER_PADDING_X = 48;
const CLUSTER_PADDING_Y = 56;
const CLUSTER_HEADER = 40;

export function getLayoutSpacing(nodeCount, edgeCount) {
  const scale = Math.min(2.2, 1 + Math.log10(Math.max(nodeCount, 1)));
  const edgeScale = Math.min(1.6, 1 + Math.log10(Math.max(edgeCount, 1)) * 0.15);

  return {
    nodesep: Math.round(55 * scale),
    ranksep: Math.round(75 * scale * edgeScale),
    edgesep: Math.round(18 * edgeScale),
    marginx: 32,
    marginy: 32,
  };
}

function runDagreLayout(nodes, edges, nodeSizeFn, graphOptions = {}) {
  if (nodes.length === 0) {
    return new Map();
  }

  const spacing = graphOptions.spacing ?? getLayoutSpacing(nodes.length, edges.length);
  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));
  graph.setGraph({
    rankdir: graphOptions.rankdir ?? 'TB',
    align: graphOptions.align,
    nodesep: spacing.nodesep,
    ranksep: spacing.ranksep,
    edgesep: spacing.edgesep,
    marginx: spacing.marginx,
    marginy: spacing.marginy,
    ranker: graphOptions.ranker ?? 'network-simplex',
    acyclicer: graphOptions.acyclicer ?? 'greedy',
  });

  nodes.forEach((node) => {
    const size = nodeSizeFn(node);
    graph.setNode(node.id, { width: size.width, height: size.height });
  });

  const nodeIds = new Set(nodes.map((n) => n.id));
  edges.forEach((edge) => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      graph.setEdge(edge.source, edge.target);
    }
  });

  dagre.layout(graph);

  const positions = new Map();
  nodes.forEach((node) => {
    const layoutNode = graph.node(node.id);
    const size = nodeSizeFn(node);
    positions.set(node.id, {
      x: layoutNode.x - size.width / 2,
      y: layoutNode.y - size.height / 2,
      width: size.width,
      height: size.height,
    });
  });

  return positions;
}

/**
 * Single-layer Dagre layout (legacy helper).
 */
export function applyDagreLayout(nodes, edges, direction = 'TB') {
  const positions = runDagreLayout(
    nodes,
    edges,
    () => ({ width: FILE_NODE_WIDTH, height: FILE_NODE_HEIGHT }),
    { rankdir: direction, spacing: getLayoutSpacing(nodes.length, edges.length) },
  );

  return nodes.map((node) => ({
    ...node,
    position: {
      x: positions.get(node.id)?.x ?? 0,
      y: positions.get(node.id)?.y ?? 0,
    },
  }));
}

function measureBounds(positions, nodeSizeFn, nodes) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    const pos = positions.get(node.id);
    if (!pos) {
      continue;
    }
    const size = nodeSizeFn(node);
    minX = Math.min(minX, pos.x);
    minY = Math.min(minY, pos.y);
    maxX = Math.max(maxX, pos.x + size.width);
    maxY = Math.max(maxY, pos.y + size.height);
  }

  if (!Number.isFinite(minX)) {
    return { width: FILE_NODE_WIDTH + CLUSTER_PADDING_X * 2, height: FILE_NODE_HEIGHT + CLUSTER_PADDING_Y * 2 };
  }

  return {
    width: maxX - minX + CLUSTER_PADDING_X * 2,
    height: maxY - minY + CLUSTER_PADDING_Y * 2 + CLUSTER_HEADER,
    offsetX: minX - CLUSTER_PADDING_X,
    offsetY: minY - CLUSTER_PADDING_Y - CLUSTER_HEADER,
  };
}

/**
 * Two-level layout: Dagre inside each folder cluster, then Dagre on cluster super-graph.
 */
export function applyClusteredDagreLayout(fileNodes, edges) {
  if (fileNodes.length === 0) {
    return { fileNodes: [], clusterNodes: [] };
  }

  const groups = groupFileNodesByCluster(fileNodes);
  const fileToCluster = buildFileToClusterMap(fileNodes);
  const spacing = getLayoutSpacing(fileNodes.length, edges.length);

  const clusterLayouts = new Map();

  for (const [clusterKey, members] of groups) {
    const memberIds = new Set(members.map((n) => n.id));
    const internalEdges = edges.filter(
      (e) => memberIds.has(e.source) && memberIds.has(e.target),
    );

    const positions = runDagreLayout(
      members,
      internalEdges,
      () => ({ width: FILE_NODE_WIDTH, height: FILE_NODE_HEIGHT }),
      { rankdir: 'TB', spacing: { ...spacing, ranksep: Math.round(spacing.ranksep * 0.85) } },
    );

    const bounds = measureBounds(
      positions,
      () => ({ width: FILE_NODE_WIDTH, height: FILE_NODE_HEIGHT }),
      members,
    );

    const normalized = new Map();
    for (const node of members) {
      const pos = positions.get(node.id);
      normalized.set(node.id, {
        x: (pos?.x ?? 0) - bounds.offsetX,
        y: (pos?.y ?? 0) - bounds.offsetY,
      });
    }

    clusterLayouts.set(clusterKey, {
      clusterKey,
      bounds,
      positions: normalized,
      members,
    });
  }

  const superNodes = [];
  const superEdges = [];
  const superEdgeKeys = new Set();

  for (const [clusterKey, layout] of clusterLayouts) {
    superNodes.push({
      id: clusterNodeId(clusterKey),
      clusterKey,
      width: layout.bounds.width,
      height: layout.bounds.height,
    });
  }

  for (const edge of edges) {
    const sourceCluster = fileToCluster.get(edge.source);
    const targetCluster = fileToCluster.get(edge.target);
    if (!sourceCluster || !targetCluster || sourceCluster === targetCluster) {
      continue;
    }
    const key = `${sourceCluster}->${targetCluster}`;
    if (superEdgeKeys.has(key)) {
      continue;
    }
    superEdgeKeys.add(key);
    superEdges.push({
      source: clusterNodeId(sourceCluster),
      target: clusterNodeId(targetCluster),
    });
  }

  const superPositions = runDagreLayout(
    superNodes,
    superEdges,
    (node) => ({ width: node.width, height: node.height }),
    {
      rankdir: 'TB',
      spacing: {
        ...spacing,
        nodesep: Math.round(spacing.nodesep * 1.35),
        ranksep: Math.round(spacing.ranksep * 1.5),
      },
    },
  );

  const laidOutFileNodes = [];
  const clusterNodes = [];

  for (const superNode of superNodes) {
    const layout = clusterLayouts.get(superNode.clusterKey);
    const superPos = superPositions.get(superNode.id);
    if (!layout || !superPos) {
      continue;
    }

    clusterNodes.push({
      id: superNode.id,
      type: 'folderCluster',
      position: { x: superPos.x, y: superPos.y },
      data: {
        clusterKey: superNode.clusterKey,
        label: getClusterLabel(superNode.clusterKey),
        fileName: '',
        fullPath: superNode.clusterKey,
        fileCount: layout.members.length,
        expandedWidth: layout.bounds.width,
        expandedHeight: layout.bounds.height,
        collapsed: false,
      },
      style: {
        width: layout.bounds.width,
        height: layout.bounds.height,
        zIndex: 0,
      },
      selectable: true,
      draggable: true,
    });

    for (const member of layout.members) {
      const rel = layout.positions.get(member.id) ?? { x: 0, y: 0 };
      laidOutFileNodes.push({
        ...member,
        parentId: superNode.id,
        extent: 'parent',
        position: { x: rel.x, y: rel.y },
        zIndex: 1,
      });
    }
  }

  return { fileNodes: laidOutFileNodes, clusterNodes };
}
