/**
 * Directory names skipped during repository content analysis.
 */
export const IGNORED_REPOSITORY_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
]);
