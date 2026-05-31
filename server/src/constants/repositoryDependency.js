/** Extensions analyzed for dependency graph edges. */
export const DEPENDENCY_GRAPH_EXTENSIONS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.mjs',
]);

/** Maximum file nodes in the dependency graph. */
export const DEPENDENCY_GRAPH_MAX_NODES =
  Number(process.env.DEPENDENCY_GRAPH_MAX_NODES) || 500;

/** Maximum dependency edges in the graph. */
export const DEPENDENCY_GRAPH_MAX_EDGES =
  Number(process.env.DEPENDENCY_GRAPH_MAX_EDGES) || 2000;
