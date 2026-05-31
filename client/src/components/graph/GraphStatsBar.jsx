export default function GraphStatsBar({ stats, repositoryLabel }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      {repositoryLabel && (
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
          {repositoryLabel}
        </span>
      )}
      <Stat label="Total nodes" value={stats.totalNodes} />
      <Stat label="Total edges" value={stats.totalEdges} />
      <Stat label="Rendered nodes" value={stats.renderedNodes} highlight />
      <Stat label="Rendered edges" value={stats.renderedEdges} />
    </div>
  );
}

function Stat({ label, value, highlight = false }) {
  return (
    <div
      className={`rounded-lg px-3 py-2 ${highlight ? 'bg-indigo-50 ring-1 ring-indigo-100' : 'bg-slate-50'}`}
    >
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}
