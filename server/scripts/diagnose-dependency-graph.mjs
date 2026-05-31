/**
 * One-off diagnostic — run: node scripts/diagnose-dependency-graph.mjs [repoPath]
 */
import { readdir, readFile } from 'fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DEPENDENCY_GRAPH_EXTENSIONS, DEPENDENCY_GRAPH_MAX_NODES } from '../src/constants/repositoryDependency.js';
import { IGNORED_REPOSITORY_DIRS } from '../src/constants/repositoryIgnore.js';
import { parseRelativeImports } from '../src/utils/importParser.js';
import { resolveRelativeImport, toRepoRelativeId } from '../src/utils/moduleResolver.js';
import { prioritizeSourceFiles } from '../src/utils/sourceFileSelection.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultRepo = path.resolve(__dirname, '../../repos/facebook-react');

async function collectSourceFiles(repoRoot) {
  const files = [];
  const queue = [repoRoot];
  while (queue.length > 0) {
    const currentDir = queue.shift();
    let entries;
    try {
      entries = await readdir(currentDir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.isSymbolicLink()) continue;
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (IGNORED_REPOSITORY_DIRS.has(entry.name)) continue;
        queue.push(entryPath);
        continue;
      }
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!DEPENDENCY_GRAPH_EXTENSIONS.has(ext)) continue;
      files.push(toRepoRelativeId(repoRoot, entryPath));
    }
  }
  return files;
}

const repoRoot = path.resolve(process.argv[2] ?? defaultRepo);
const allSourceFiles = await collectSourceFiles(repoRoot);
const knownFiles = new Set(allSourceFiles);
const { selected: filesToAnalyze, selectionMeta } = prioritizeSourceFiles(
  allSourceFiles,
  DEPENDENCY_GRAPH_MAX_NODES,
);

let filesParsed = 0;
let filesReadFailed = 0;
let importsDetected = 0;
let importsRelative = 0;
let edgesCreated = 0;
let resolveFailed = 0;
const resolveFailSamples = [];
const parsedExtensions = { '.js': 0, '.jsx': 0, '.ts': 0, '.tsx': 0, '.mjs': 0, other: 0 };
const importSyntaxCounts = { importFrom: 0, exportFrom: 0, require: 0, dynamicImport: 0, bareAlias: 0 };

const IMPORT_ONLY = /import\s+(?:type\s+)?['"]([^'"]+)['"]/g;
const IMPORT_FROM = /import\s+(?:type\s+)?(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g;
const EXPORT_FROM = /export\s+(?:type\s+)?(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g;
const REQUIRE = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
const DYNAMIC = /import\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

function classifySpecifier(spec) {
  if (spec.startsWith('./') || spec.startsWith('../')) return 'relative';
  if (spec.startsWith('@/') || spec.startsWith('~/')) return 'pathAlias';
  return 'package';
}

for (const fileId of filesToAnalyze) {
  let source;
  try {
    source = await readFile(path.join(repoRoot, fileId), 'utf8');
    filesParsed++;
  } catch {
    filesReadFailed++;
    continue;
  }

  const ext = path.extname(fileId).toLowerCase();
  if (parsedExtensions[ext] !== undefined) parsedExtensions[ext]++;
  else parsedExtensions.other++;

  for (const m of source.matchAll(IMPORT_FROM)) {
    importSyntaxCounts.importFrom++;
    const kind = classifySpecifier(m[1]);
    if (kind === 'relative') importsRelative++;
    else if (kind === 'pathAlias') importSyntaxCounts.bareAlias++;
  }
  for (const m of source.matchAll(EXPORT_FROM)) importSyntaxCounts.exportFrom++;
  for (const m of source.matchAll(REQUIRE)) {
    importSyntaxCounts.require++;
    if (classifySpecifier(m[1]) === 'relative') importsRelative++;
  }
  for (const m of source.matchAll(DYNAMIC)) {
    importSyntaxCounts.dynamicImport++;
    if (classifySpecifier(m[1]) === 'relative') importsRelative++;
  }

  const specifiers = parseRelativeImports(source);
  importsDetected += specifiers.length;

  for (const specifier of specifiers) {
    const target = resolveRelativeImport(fileId, specifier, knownFiles);
    if (target) {
      edgesCreated++;
    } else {
      resolveFailed++;
      if (resolveFailSamples.length < 15) {
        resolveFailSamples.push({ from: fileId, specifier });
      }
    }
  }
}

const reactSrcInDiscovered = allSourceFiles.filter((f) => f.startsWith('packages/react/src/')).length;
const reactSrcInParsed = filesToAnalyze.filter((f) => f.startsWith('packages/react/src/')).length;

console.log(JSON.stringify({
  repoRoot,
  limits: { maxNodes: DEPENDENCY_GRAPH_MAX_NODES },
  sourceFilesDiscovered: allSourceFiles.length,
  sourceFilesSelected: filesToAnalyze.length,
  selectionTierCounts: selectionMeta.tierCounts,
  sourceFilesParsed: filesParsed,
  sourceFilesInParseQueue: filesToAnalyze.length,
  sourceFilesReadFailed: filesReadFailed,
  reactSrcDiscovered: reactSrcInDiscovered,
  reactSrcInFirst500Parsed: reactSrcInParsed,
  first10ParsedFiles: filesToAnalyze.slice(0, 10),
  last5ParsedFiles: filesToAnalyze.slice(-5),
  parsedByExtension: parsedExtensions,
  importSyntaxRawCounts: importSyntaxCounts,
  importsDetectedByParser: importsDetected,
  importsRelativeInParsedSet: importsRelative,
  edgesCreated,
  resolveFailed,
  edgeYieldPercent: importsDetected ? ((edgesCreated / importsDetected) * 100).toFixed(1) : 0,
  resolveFailSamples,
}, null, 2));
