import { useCallback, useEffect, useMemo } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react';
import { computeSearchHighlight, getNodeHighlightRole } from '../../utils/graphSearch.js';
import FileNode from './FileNode.jsx';

const nodeTypes = { fileNode: FileNode };

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

  const highlight = useMemo(
    () => computeSearchHighlight(initialNodes, initialEdges, searchQuery),
    [initialNodes, initialEdges, searchQuery],
  );

  const { displayNodes, displayEdges } = useMemo(() => {
    const nextNodes = initialNodes.map((node) => {
      const visible = highlight.visibleNodeIds.has(node.id);
      const highlightRole = highlight.filterActive
        ? getNodeHighlightRole(node.id, highlight)
        : null;

      return {
        ...node,
        selected: node.id === selectedNodeId,
        hidden: highlight.filterActive && !visible,
        data: {
          ...node.data,
          dimmed: false,
          highlightRole,
        },
      };
    });

    const nextEdges = initialEdges.map((edge) => {
      const visible = highlight.visibleEdgeIds.has(edge.id);
      const connectsMatch =
        highlight.filterActive &&
        (highlight.matchIds.has(edge.source) || highlight.matchIds.has(edge.target));

      return {
        ...edge,
        hidden: highlight.filterActive && !visible,
        animated: connectsMatch,
        style: {
          ...edge.style,
          stroke: connectsMatch ? '#6366f1' : '#94a3b8',
          strokeWidth: connectsMatch ? 2.5 : 1.5,
          opacity: visible ? 1 : 0.12,
        },
      };
    });

    return { displayNodes: nextNodes, displayEdges: nextEdges };
  }, [initialNodes, initialEdges, highlight, selectedNodeId]);

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
      onNodeSelect(node.id === selectedNodeId ? null : node.id);
    },
    [onNodeSelect, selectedNodeId],
  );

  const onPaneClick = useCallback(() => {
    onNodeSelect(null);
  }, [onNodeSelect]);

  if (initialNodes.length === 0) {
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
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.05}
        maxZoom={2}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={20} size={1} color="#e2e8f0" />
        <Controls className="!rounded-lg !border-slate-200 !shadow-sm" />
        <MiniMap
          className="!rounded-lg !border-slate-200 !shadow-sm"
          nodeColor={(node) => node.data?.colors?.border ?? '#6366f1'}
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
