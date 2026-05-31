/**
 * Centralized access to Vite environment variables.
 * Only variables prefixed with VITE_ are exposed to the client bundle.
 */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  appName: import.meta.env.VITE_APP_NAME ?? 'AI Codebase Intelligence',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
};
