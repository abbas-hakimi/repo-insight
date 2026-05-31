import { env } from '../../config/env.js';

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
            Repository Analyzer
          </p>
          <h1 className="text-xl font-semibold text-slate-900">{env.appName}</h1>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          MVP Dashboard
        </span>
      </div>
    </header>
  );
}
