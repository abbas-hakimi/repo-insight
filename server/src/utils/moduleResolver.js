import path from 'node:path';

const EXTENSIONS = ['', '.js', '.jsx', '.ts', '.tsx', '.mjs'];
const INDEX_FILES = [
  'index.js',
  'index.jsx',
  'index.ts',
  'index.tsx',
  'index.mjs',
];

/**
 * Resolve a relative import specifier to a repo-relative POSIX file id.
 * @param {string} fromFileId - e.g. src/App.jsx
 * @param {string} specifier - e.g. ./components/Navbar
 * @param {Set<string>} knownFiles - all discovered source file ids
 * @returns {string | null}
 */
export function resolveRelativeImport(fromFileId, specifier, knownFiles) {
  const fromDir = path.posix.dirname(fromFileId);
  const joined = path.posix.normalize(path.posix.join(fromDir, specifier));

  const candidates = new Set();

  for (const ext of EXTENSIONS) {
    candidates.add(`${joined}${ext}`);
  }

  for (const indexFile of INDEX_FILES) {
    candidates.add(path.posix.join(joined, indexFile));
  }

  for (const candidate of candidates) {
    if (knownFiles.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Convert an absolute path to a repo-relative POSIX id.
 */
export function toRepoRelativeId(repoRoot, absolutePath) {
  const relative = path.relative(repoRoot, absolutePath);
  return relative.split(path.sep).join('/');
}
