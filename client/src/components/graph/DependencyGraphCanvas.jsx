import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { isClusterNodeId } from '../../utils/graphClustering.js';
import { computeSearchHighlight, getNodeHighlightRole } from '../../utils/graphSearch.js';
import FileNode from './FileNode.jsx';
import FolderClusterNode from './FolderClusterNode.jsx';

const nodeTypes = { fileNode: FileNode, folderCluster: FolderClusterNode };

function buildClusterChildMap(nodes) {
  const map = new Map();
  for (const node of nodes) {
    if (node.parentId) {
      if (!map.has(node.parentId)) {
        map.set(node.parentId, []);
      }
      map.get(node.parentId).push(node.id);
    }
  }
  return map;
}

function buildFileParentMap(nodes) {
  const map = new Map();
  for (const node of nodes) {
    if (node.parentId) {
      map.set(node.id, node.parentId);
    }
  }
  return map;
}

function remapEdgesForCollapsed(edges, collapsedClusterIds, fileParentMap) {
  const seen = new Set();
  const result = [];

  for (const edge of edges) {
    let source = edge.source;
    let target = edge.target;

    const sourceParent = fileParentMap.get(source);
    const targetParent = fileParentMap.get(target);

    if (sourceParent && collapsedClusterIds.has(sourceParent)) {
      source = sourceParent;
    }
    if (targetParent && collapsedClusterIds.has(targetParent)) {
      target = targetParent;
    }

    if (source === target) {
      continue;
    }

    const key = `${source}|${target}|${edge.id}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    result.push({
      ...edge,
      source,
      target,
    });
  }

  return result;
}

export default function DependencyGraphCanvas({
  initialNodes,
  initialEdges,
  searchQuery,
  selectedNodeId,
  onNodeSelect,
  onSearchStatsChange,
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [collapsedClusterIds, setCollapsedClusterIds] = useState(() => new Set());

  const clusterChildMap = useMemo(() => buildClusterChildMap(initialNodes), [initialNodes]);
  const fileParentMap = useMemo(() => buildFileParentMap(initialNodes), [initialNodes]);

  const highlight = useMemo(
    () => computeSearchHighlight(initialNodes, initialEdges, searchQuery),
    [initialNodes, initialEdges, searchQuery],
  );

  const toggleCluster = useCallback((clusterId) => {
    setCollapsedClusterIds((prev) => {
      const next = new Set(prev);
      if (next.has(clusterId)) {
        next.delete(clusterId);
      } else {
        next.add(clusterId);
      }
      return next;
    });
  }, []);

  const isClusterVisible = useCallback(
    (clusterId) => {
      if (!highlight.filterActive) {
        return true;
      }
      const children = clusterChildMap.get(clusterId) ?? [];
      return children.some((childId) => highlight.visibleNodeIds.has(childId));
    },
    [highlight.filterActive, highlight.visibleNodeIds, clusterChildMap],
  );

  useEffect(() => {
    if (!highlight.filterActive || highlight.matchIds.size === 0) {
      return;
    }
    setCollapsedClusterIds((prev) => {
      const next = new Set(prev);
      for (const node of initialNodes) {
        if (node.parentId && highlight.matchIds.has(node.id)) {
          next.delete(node.parentId);
        }
      }
      return next;
    });
  }, [highlight.filterActive, highlight.matchIds, initialNodes]);

  const { displayNodes, displayEdges } = useMemo(() => {
    const nextNodes = initialNodes.map((node) => {
      if (isClusterNodeId(node.id)) {
        const collapsed = collapsedClusterIds.has(node.id);
        const visible = isClusterVisible(node.id);

        return {
          ...node,
          selected: node.id === selectedNodeId,
          hidden: highlight.filterActive && !visible,
          data: {
            ...node.data,
            collapsed,
            onToggle: () => toggleCluster(node.id),
          },
          style: {
            ...node.style,
            width: collapsed ? 240 : node.data.expandedWidth,
            height: collapsed ? 52 : node.data.expandedHeight,
          },
        };
      }

      const parentCollapsed = node.parentId && collapsedClusterIds.has(node.parentId);
      const fileVisible = !highlight.filterActive || highlight.visibleNodeIds.has(node.id);
      const highlightRole = highlight.filterActive
        ? getNodeHighlightRole(node.id, highlight)
        : null;

      return {
        ...node,
        selected: node.id === selectedNodeId,
        hidden: parentCollapsed || (highlight.filterActive && !fileVisible),
        data: {
          ...node.data,
          dimmed: false,
          highlightRole,
        },
      };
    });

    const edgesForLayout = remapEdgesForCollapsed(
      initialEdges,
      collapsedClusterIds,
      fileParentMap,
    );

    const nodeById = new Map(nextNodes.map((node) => [node.id, node]));

    const nextEdges = edgesForLayout.map((edge) => {
      const sourceNode = nodeById.get(edge.source);
      const targetNode = nodeById.get(edge.target);
      const endpointHidden = Boolean(sourceNode?.hidden || targetNode?.hidden);
      const visibleBySearch =
        !highlight.filterActive || highlight.visibleEdgeIds.has(edge.id);

      const connectsMatch =
        highlight.filterActive &&
        (highlight.matchIds.has(edge.source) ||
          highlight.matchIds.has(edge.target) ||
          (isClusterNodeId(edge.source) &&
            clusterChildMap.get(edge.source)?.some((id) => highlight.matchIds.has(id))) ||
          (isClusterNodeId(edge.target) &&
            clusterChildMap.get(edge.target)?.some((id) => highlight.matchIds.has(id))));

      return {
        ...edge,
        hidden: endpointHidden || (highlight.filterActive && !visibleBySearch),
        animated: connectsMatch,
        style: {
          ...edge.style,
          stroke: connectsMatch ? '#6366f1' : '#94a3b8',
          strokeWidth: connectsMatch ? 2.5 : 1.5,
          opacity: endpointHidden ? 0.08 : visibleBySearch ? 1 : 0.12,
        },
      };
    });

    return { displayNodes: nextNodes, displayEdges: nextEdges };
  }, [
    initialNodes,
    initialEdges,
    highlight,
    selectedNodeId,
    collapsedClusterIds,
    fileParentMap,
    clusterChildMap,
    isClusterVisible,
    toggleCluster,
  ]);

  useEffect(() => {
    setNodes(displayNodes);
    setEdges(displayEdges);
  }, [displayNodes, displayEdges, setNodes, setEdges]);

  useEffect(() => {
    if (!onSearchStatsChange) {
      return;
    }
    onSearchStatsChange({
      matchCount: highlight.matchIds.size,
      incomingCount: highlight.incomingIds.size,
      outgoingCount: highlight.outgoingIds.size,
      edgeCount: highlight.visibleEdgeIds.size,
    });
  }, [highlight, onSearchStatsChange]);

  const onNodeClick = useCallback(
    (_event, node) => {
      if (isClusterNodeId(node.id)) {
        return;
      }
      onNodeSelect(node.id === selectedNodeId ? null : node.id);
    },
    [onNodeSelect, selectedNodeId],
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  const fileNodeCount = useMemo(
    () => initialNodes.filter((node) => !isClusterNodeId(node.id)).length,
    [initialNodes],
  );

  if (fileNodeCount === 0) {
    return (
      <div className="flex h-[min(70vh,640px)] items-center justify-center rounded-xl border border-slate-200 bg-white text-sm text-slate-500 shadow-sm">
        No nodes to display in this graph slice.
      </div>
    );
  }

  return (
    <div className="h-[min(70vh,640px)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3, maxZoom: 1.2 }}
        minZoom={0.04}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        elevateEdgesOnSelect
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="#e2e8f0" />
        <Controls className="!rounded-lg !border-slate-200 !shadow-sm" />
        <MiniMap
          className="!rounded-lg !border-slate-200 !shadow-sm"
          nodeColor={(node) =>
            isClusterNodeId(node.id) ? '#cbd5e1' : (node.data?.colors?.border ?? '#6366f1')
          }
          maskColor="rgba(241, 245, 249, 0.75)"
        />
      </ReactFlow>
      {highlight.filterActive && highlight.matchIds.size === 0 && (
        <p className="border-t border-slate-100 bg-amber-50 px-4 py-2 text-center text-xs text-amber-800">
          No nodes match this filter.
        </p>
      )}
    </div>
  );
}
