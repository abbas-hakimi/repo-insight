import { Link } from 'react-router-dom';

export default function GraphEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-8 py-16 text-center shadow-sm">
      <p className="text-lg font-semibold text-slate-900">No dependency graph available</p>
      <p className="mt-2 max-w-md text-sm text-slate-600">
        Analyze a repository on the dashboard first, then open the graph view from the results.
      </p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
