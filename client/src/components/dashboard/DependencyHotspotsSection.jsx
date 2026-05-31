import HotspotRankTable from './HotspotRankTable.jsx';

export default function DependencyHotspotsSection({ dependencyHotspots }) {
  const topImported = dependencyHotspots?.topImported ?? [];
  const topImporting = dependencyHotspots?.topImporting ?? [];
  const filesAnalyzed = dependencyHotspots?.totals?.filesAnalyzed ?? 0;

  return (
    <section>
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Dependency Hotspots</h2>
        <p className="mt-1 text-sm text-slate-500">
          Ranked by relative import relationships across {filesAnalyzed} files in the dependency
          graph.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <HotspotRankTable
          title="Top 10 Most Imported Files"
          description="Files imported by the most other modules (high incoming dependencies)."
          rows={topImported}
          countLabel="Imports"
          emptyMessage="No imported files in the dependency graph."
        />
        <HotspotRankTable
          title="Top 10 Most Importing Files"
          description="Files that import the most other modules (high outgoing dependencies)."
          rows={topImporting}
          countLabel="Imports"
          emptyMessage="No importing files in the dependency graph."
        />
      </div>
    </section>
  );
}
