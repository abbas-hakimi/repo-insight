import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DependencyGraphCanvas from '../components/graph/DependencyGraphCanvas.jsx';
import GraphEmptyState from '../components/graph/GraphEmptyState.jsx';
import GraphExtractionStats from '../components/graph/GraphExtractionStats.jsx';
import GraphLoadingState from '../components/graph/GraphLoadingState.jsx';
import GraphSearchBar from '../components/graph/GraphSearchBar.jsx';
import GraphStatsBar from '../components/graph/GraphStatsBar.jsx';
import NodeDetailsPanel from '../components/graph/NodeDetailsPanel.jsx';
import Header from '../components/layout/Header.jsx';
import {
  getNodeDependencies,
  mapDependencyGraphToReactFlow,
} from '../utils/dependencyGraphMapper.js';

export default function DependencyGraphPage() {
  const location = useLocation();
  const analysisResult = location.state?.analysisResult;
  const [loading, setLoading] = useState(Boolean(analysisResult));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [searchStats, setSearchStats] = useState({
    matchCount: 0,
    incomingCount: 0,
    outgoingCount: 0,
    edgeCount: 0,
  });

  const graphData = useMemo(() => {
    if (!analysisResult?.dependencyGraph) {
      return null;
    }
    return mapDependencyGraphToReactFlow(analysisResult.dependencyGraph);
  }, [analysisResult]);

  useEffect(() => {
    if (!analysisResult) {
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    const timer = window.setTimeout(() => setLoading(false), 300);
    return () => window.clearTimeout(timer);
  }, [analysisResult, graphData]);

  const selectedNode = useMemo(
    () => graphData?.nodes.find((node) => node.id === selectedNodeId) ?? null,
    [graphData, selectedNodeId],
  );

  const { incoming, outgoing } = useMemo(() => {
    if (!selectedNodeId || !graphData) {
      return { incoming: [], outgoing: [] };
    }
    return getNodeDependencies(selectedNodeId, graphData.edges);
  }, [selectedNodeId, graphData]);

  const handleSearchStatsChange = useCallback((stats) => {
    setSearchStats(stats);
  }, []);

  const repositoryLabel =
    analysisResult?.owner && analysisResult?.repositoryName
      ? `${analysisResult.owner}/${analysisResult.repositoryName}`
      : null;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dependency Graph</h2>
            <p className="mt-1 text-sm text-slate-600">
              Priority source paths · Dagre layout · search shows neighbors and connecting edges
            </p>
          </div>
          <Link
            to="/"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {!analysisResult && <GraphEmptyState />}

        {analysisResult && loading && <GraphLoadingState />}

        {analysisResult && !loading && graphData && (
          <>
            <GraphExtractionStats graphMeta={analysisResult.graphMeta} />
            <GraphStatsBar stats={graphData.stats} repositoryLabel={repositoryLabel} />
            <GraphSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              matchCount={searchStats.matchCount}
              incomingCount={searchStats.incomingCount}
              outgoingCount={searchStats.outgoingCount}
              edgeCount={searchStats.edgeCount}
              totalCount={graphData.nodes.length}
            />

            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <DependencyGraphCanvas
                  initialNodes={graphData.nodes}
                  initialEdges={graphData.edges}
                  searchQuery={searchQuery}
                  selectedNodeId={selectedNodeId}
                  onNodeSelect={setSelectedNodeId}
                  onSearchStatsChange={handleSearchStatsChange}
                />
              </div>
              {selectedNode && (
                <NodeDetailsPanel
                  node={selectedNode}
                  incoming={incoming}
                  outgoing={outgoing}
                  onClose={() => setSelectedNodeId(null)}
                />
              )}
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-600">
              <Legend swatch="#fbbf24" label="Search match" />
              <Legend swatch="#a78bfa" label="Incoming neighbor" />
              <Legend swatch="#2dd4bf" label="Outgoing neighbor" />
              <Legend swatch="#6366f1" label="Connecting edge (animated)" />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Legend({ swatch, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="h-3 w-3 rounded border-2"
        style={{ borderColor: swatch, background: `${swatch}33` }}
      />
      {label}
    </span>
  );
}
