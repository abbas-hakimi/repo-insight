const EDGE_PREVIEW_LIMIT = 20;

export default function DependencyEdgesTable({ edges = [] }) {
  const previewEdges = edges.slice(0, EDGE_PREVIEW_LIMIT);

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Dependency edges</h2>
        <p className="mt-1 text-sm text-slate-500">
          Showing first {previewEdges.length} of {edges.length} edges
        </p>
      </div>

      {previewEdges.length === 0 ? (
        <p className="px-6 py-8 text-sm text-slate-500">No dependency edges found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 font-semibold text-slate-600">#</th>
                <th className="px-6 py-3 font-semibold text-slate-600">Source</th>
                <th className="px-6 py-3 font-semibold text-slate-600">Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {previewEdges.map((edge, index) => (
                <tr key={`${edge.source}-${edge.target}-${index}`} className="hover:bg-slate-50">
                  <td className="px-6 py-3 text-slate-500">{index + 1}</td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-800">{edge.source}</td>
                  <td className="px-6 py-3 font-mono text-xs text-slate-800">{edge.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
