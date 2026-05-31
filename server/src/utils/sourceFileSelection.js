/**
 * Priority tiers for dependency graph file selection (first match wins).
 * More specific paths must appear before generic /src/ rules.
 */
const PRIORITY_RULES = [
  {
    key: 'packages-src',
    test: (filePath) => /^packages\/[^/]+\/src\//.test(filePath),
  },
  {
    key: 'src',
    test: (filePath) => {
      if (/^packages\/[^/]+\/src\//.test(filePath)) {
        return false;
      }
      return /(?:^|\/)src\//.test(filePath) || filePath.startsWith('src/');
    },
  },
  {
    key: 'app',
    test: (filePath) => /(?:^|\/)app\//.test(filePath) || filePath.startsWith('app/'),
  },
  {
    key: 'components',
    test: (filePath) =>
      /(?:^|\/)components\//.test(filePath) || filePath.startsWith('components/'),
  },
  {
    key: 'lib',
    test: (filePath) => /(?:^|\/)lib\//.test(filePath) || filePath.startsWith('lib/'),
  },
];

const OTHER_TIER = 'other';
const TIER_ORDER = [...PRIORITY_RULES.map((rule) => rule.key), OTHER_TIER];

// Core runtime packages first (packages/react/src, etc.), then alphabetical within tier.
const CORE_PACKAGES_SRC = [
  /^packages\/react\/src\//,
  /^packages\/react-dom\/src\//,
  /^packages\/scheduler\/src\//,
  /^packages\/shared\/src\//,
  /^packages\/react-reconciler\/src\//,
];

function getFileTier(filePath) {
  for (const rule of PRIORITY_RULES) {
    if (rule.test(filePath)) {
      return rule.key;
    }
  }
  return OTHER_TIER;
}

function packagesSrcSortRank(filePath) {
  const index = CORE_PACKAGES_SRC.findIndex((pattern) => pattern.test(filePath));
  return index === -1 ? CORE_PACKAGES_SRC.length : index;
}

function compareSourceFiles(a, b) {
  const tierA = getFileTier(a);
  const tierB = getFileTier(b);
  if (tierA !== tierB) {
    return TIER_ORDER.indexOf(tierA) - TIER_ORDER.indexOf(tierB);
  }
  if (tierA === 'packages-src') {
    const rankDiff = packagesSrcSortRank(a) - packagesSrcSortRank(b);
    if (rankDiff !== 0) {
      return rankDiff;
    }
  }
  return a.localeCompare(b);
}

/**
 * Select up to maxCount source files by directory priority, then alphabetically within each tier.
 */
export function prioritizeSourceFiles(allFiles, maxCount) {
  const tierCounts = Object.fromEntries(TIER_ORDER.map((tier) => [tier, 0]));

  const selected = [];
  const allRanked = allFiles.slice().sort(compareSourceFiles);

  for (const filePath of allRanked) {
    if (selected.length >= maxCount) {
      break;
    }
    selected.push(filePath);
    tierCounts[getFileTier(filePath)] += 1;
  }

  return {
    selected,
    selectionMeta: {
      maxCount,
      totalDiscovered: allFiles.length,
      selectedCount: selected.length,
      truncated: allFiles.length > maxCount,
      tierCounts,
    },
  };
}
