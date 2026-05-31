import { useState } from 'react';
import AnalyzeForm from '../components/dashboard/AnalyzeForm.jsx';
import DependencyEdgesTable from '../components/dashboard/DependencyEdgesTable.jsx';
import StatsGrid from '../components/dashboard/StatsGrid.jsx';
import ViewGraphButton from '../components/graph/ViewGraphButton.jsx';
import Header from '../components/layout/Header.jsx';
import { analyzeRepository } from '../services/repositoryService.js';

export default function RepositoryDashboard() {
  const [githubUrl, setGithubUrl] = useState('https://github.com/facebook/react');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const data = await analyzeRepository(githubUrl.trim());
      setResult(data);
    } catch (err) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Repository Analyzer Dashboard</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Enter a public GitHub URL to clone the repository, scan file statistics, and build a
            dependency graph of relative imports.
          </p>
        </div>

        <AnalyzeForm
          githubUrl={githubUrl}
          onGithubUrlChange={setGithubUrl}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            Cloning and analyzing repository… This may take a minute for large repos.
          </div>
        )}

        {result && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-end gap-3">
              <ViewGraphButton analysisResult={result} />
            </div>
            <StatsGrid result={result} />
            <DependencyEdgesTable edges={result.dependencyGraph?.edges ?? []} />
          </div>
        )}
      </main>
    </div>
  );
}
