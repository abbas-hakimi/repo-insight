export default function GraphSearchBar({
  value,
  onChange,
  matchCount,
  incomingCount,
  outgoingCount,
  edgeCount,
  totalCount,
}) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="graph-search" className="text-sm font-medium text-slate-700">
          Filter by filename
        </label>
        <input
          id="graph-search"
          type="search"
          placeholder="e.g. ReactDOM.js"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-[200px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>
      {value.trim() && (
        <p className="text-xs text-slate-600">
          Showing <strong>{matchCount}</strong> match(es), <strong>{incomingCount}</strong>{' '}
          incoming, <strong>{outgoingCount}</strong> outgoing — <strong>{edgeCount}</strong>{' '}
          connecting edge(s) (of {totalCount} nodes in graph)
        </p>
      )}
    </div>
  );
}
