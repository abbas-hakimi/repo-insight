const CONFIG_NAMES = new Set([
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'jsconfig.json',
  '.eslintrc',
  '.eslintrc.js',
  '.eslintrc.cjs',
  'eslint.config.js',
  'vite.config.js',
  'vite.config.ts',
  'webpack.config.js',
  'rollup.config.js',
  'prettier.config.js',
  'tailwind.config.js',
  'babel.config.js',
]);

const CONFIG_EXTENSIONS = new Set(['.json', '.yaml', '.yml', '.toml', '.env']);

export function getFileName(filePath) {
  const segments = filePath.split('/');
  return segments[segments.length - 1] || filePath;
}

export function isConfigFile(filePath) {
  const fileName = getFileName(filePath).toLowerCase();
  const extension = fileName.includes('.') ? `.${fileName.split('.').pop()}` : '';

  if (CONFIG_NAMES.has(fileName) || CONFIG_NAMES.has(getFileName(filePath))) {
    return true;
  }

  if (CONFIG_EXTENSIONS.has(extension)) {
    return true;
  }

  return (
    fileName.includes('.config.') ||
    fileName.endsWith('rc') ||
    fileName.endsWith('rc.js') ||
    fileName.endsWith('rc.cjs')
  );
}

/**
 * @returns {{ background: string, border: string, text: string }}
 */
export function getNodeColors(filePath) {
  const lower = filePath.toLowerCase();

  if (isConfigFile(filePath)) {
    return {
      background: '#ffedd5',
      border: '#f97316',
      text: '#9a3412',
    };
  }

  if (lower.endsWith('.ts') || lower.endsWith('.tsx')) {
    return {
      background: '#dbeafe',
      border: '#3b82f6',
      text: '#1e3a8a',
    };
  }

  if (lower.endsWith('.js') || lower.endsWith('.jsx') || lower.endsWith('.mjs')) {
    return {
      background: '#dcfce7',
      border: '#22c55e',
      text: '#14532d',
    };
  }

  return {
    background: '#f1f5f9',
    border: '#94a3b8',
    text: '#334155',
  };
}
