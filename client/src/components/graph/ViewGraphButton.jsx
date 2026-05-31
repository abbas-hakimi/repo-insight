import { useNavigate } from 'react-router-dom';

export default function ViewGraphButton({ analysisResult }) {
  const navigate = useNavigate();

  function handleClick() {
    navigate('/dependency-graph', { state: { analysisResult } });
  }

  const nodeCount = analysisResult?.dependencyGraph?.nodes?.length ?? 0;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={nodeCount === 0}
      className="rounded-lg border border-indigo-200 bg-indigo-50 px-5 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
    >
      View Dependency Graph
    </button>
  );
}
