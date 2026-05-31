import { env } from '../config/env.js';

/**
 * Base HTTP client configuration.
 * Feature-specific API calls live in separate service modules under src/services/.
 */
export const apiConfig = {
  baseURL: env.apiBaseUrl,
};
