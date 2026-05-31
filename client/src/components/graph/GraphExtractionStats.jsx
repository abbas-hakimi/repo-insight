export default function GraphExtractionStats({ graphMeta }) {
  if (!graphMeta) {
    return null;
  }

  const items = [
    { label: 'Files discovered', value: graphMeta.filesDiscovered },
    { label: 'Files selected', value: graphMeta.filesSelected },
    { label: 'Files parsed', value: graphMeta.filesParsed },
    { label: 'Imports detected', value: graphMeta.importsDetected },
    { label: 'Edges created', value: graphMeta.edgesCreated },
    { label: 'Graph nodes', value: graphMeta.nodes },
    { label: 'Graph edges', value: graphMeta.edges },
  ];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Extraction diagnostics</h3>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="text-lg font-semibold text-slate-900">{item.value ?? '—'}</p>
          </div>
        ))}
      </div>
      {graphMeta.selectionTierCounts && (
        <p className="mt-3 text-xs text-slate-500">
          Selected by priority — src: {graphMeta.selectionTierCounts.src ?? 0}, app:{' '}
          {graphMeta.selectionTierCounts.app ?? 0}, packages/*/src:{' '}
          {graphMeta.selectionTierCounts['packages-src'] ?? 0}, components:{' '}
          {graphMeta.selectionTierCounts.components ?? 0}, lib:{' '}
          {graphMeta.selectionTierCounts.lib ?? 0}, other:{' '}
          {graphMeta.selectionTierCounts.other ?? 0}
        </p>
      )}
    </div>
  );
}
