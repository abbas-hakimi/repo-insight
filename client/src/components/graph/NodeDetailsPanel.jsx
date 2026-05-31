function DependencyList({ title, paths }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      {paths.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">None</p>
      ) : (
        <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
          {paths.map((path) => (
            <li
              key={path}
              className="rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700 break-all"
            >
              {path}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function NodeDetailsPanel({ node, incoming, outgoing, onClose }) {
  if (!node) {
    return null;
  }

  return (
    <aside className="w-full shrink-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:w-80">
      <div className="mb-4 flex items-start justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">File details</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
        >
          Close
        </button>
      </div>

      <p className="mb-1 text-xs font-medium text-slate-500">Full path</p>
      <p className="mb-4 break-all font-mono text-xs text-slate-800">{node.data.fullPath}</p>

      <div className="space-y-4">
        <DependencyList title="Incoming dependencies" paths={incoming} />
        <DependencyList title="Outgoing dependencies" paths={outgoing} />
      </div>
    </aside>
  );
}
