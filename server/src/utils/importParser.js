/**
 * Extract relative module specifiers from JS/TS source via regex.
 * Covers: import, export-from, and require().
 */
const IMPORT_FROM_PATTERN =
  /import\s+(?:type\s+)?(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g;
const EXPORT_FROM_PATTERN = /export\s+(?:type\s+)?(?:[^'";]+\s+from\s+)?['"]([^'"]+)['"]/g;
const REQUIRE_PATTERN = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

function isRelativeSpecifier(specifier) {
  return specifier.startsWith('./') || specifier.startsWith('../');
}

function collectMatches(pattern, source) {
  const specifiers = [];
  for (const match of source.matchAll(pattern)) {
    const specifier = match[1];
    if (isRelativeSpecifier(specifier)) {
      specifiers.push(specifier);
    }
  }
  return specifiers;
}

export function parseRelativeImports(source) {
  return [
    ...collectMatches(IMPORT_FROM_PATTERN, source),
    ...collectMatches(EXPORT_FROM_PATTERN, source),
    ...collectMatches(REQUIRE_PATTERN, source),
  ];
}
