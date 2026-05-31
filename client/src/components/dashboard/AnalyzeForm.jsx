export default function AnalyzeForm({ githubUrl, onGithubUrlChange, onSubmit, loading }) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <label htmlFor="githubUrl" className="mb-2 block text-sm font-medium text-slate-700">
        GitHub repository URL
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="githubUrl"
          type="url"
          required
          placeholder="https://github.com/facebook/react"
          value={githubUrl}
          onChange={(e) => onGithubUrlChange(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none ring-indigo-500 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>
    </form>
  );
}
