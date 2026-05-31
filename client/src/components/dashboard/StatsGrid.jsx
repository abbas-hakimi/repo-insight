function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function StatsGrid({ result }) {
  const { owner, repositoryName, statistics, graphMeta } = result;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Analysis summary</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Owner" value={owner} />
        <StatCard label="Repository" value={repositoryName} />
        <StatCard label="Total files" value={statistics?.totalFiles ?? '—'} />
        <StatCard label="Total folders" value={statistics?.totalFolders ?? '—'} />
        <StatCard label="Graph nodes" value={graphMeta?.nodes ?? '—'} />
        <StatCard label="Graph edges" value={graphMeta?.edges ?? '—'} />
      </div>
    </section>
  );
}
