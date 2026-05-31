export default function GraphLoadingState() {
  return (
    <div className="flex h-[560px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
      <span className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
      <p className="mt-4 text-sm font-medium text-slate-700">Preparing dependency graph…</p>
      <p className="mt-1 text-xs text-slate-500">Layout and rendering up to 100 nodes</p>
    </div>
  );
}
