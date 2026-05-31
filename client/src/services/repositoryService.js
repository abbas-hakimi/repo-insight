import { env } from '../config/env.js';

/**
 * Analyze a GitHub repository via the backend API.
 * @param {string} githubUrl
 */
export async function analyzeRepository(githubUrl) {
  const response = await fetch(`${env.apiBaseUrl}/repositories/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ githubUrl }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message ?? 'Failed to analyze repository');
  }

  return data;
}
