import { env } from '../config/env.js';

/**
 * @param {Response} response
 */
async function parseAnalyzeResponse(response) {
  const status = response.status;
  const contentType = response.headers.get('content-type') ?? '(none)';
  const text = await response.text();
  const length = text.length;

  console.log('[analyze API] response', { status, contentType, length });

  if (!text.trim()) {
    throw new Error(
      status === 0
        ? 'No response from server. Ensure the backend is running (npm run dev in server/).'
        : `Empty response body (HTTP ${status}). The connection may have closed before analysis finished—common on the first run when cloning a large repo. Click Analyze again.`,
    );
  }

  const looksLikeHtml =
    contentType.includes('text/html') || /^\s*</.test(text) || text.includes('<!DOCTYPE');

  if (looksLikeHtml) {
    throw new Error(
      `Server returned HTML instead of JSON (HTTP ${status}). The API may be down, or the Vite proxy returned an error page. Check the backend terminal and try again.`,
    );
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(
      `Invalid or truncated JSON (HTTP ${status}, ${length} bytes). Analysis can take over a minute on the first request; if the connection dropped mid-response, click Analyze again.`,
    );
  }

  if (!response.ok) {
    throw new Error(data.message ?? `Analysis failed (HTTP ${status})`);
  }

  return data;
}

/**
 * Analyze a GitHub repository via the backend API.
 * @param {string} githubUrl
 */
export async function analyzeRepository(githubUrl) {
  const url = `${env.apiBaseUrl}/repositories/analyze`;
  console.log('[analyze API] request', { url, githubUrl });

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ githubUrl }),
    });
  } catch (err) {
    throw new Error(
      err.message?.includes('fetch')
        ? 'Could not reach the API. Start the backend (server/) and ensure VITE_API_BASE_URL is /api/v1 for the dev proxy.'
        : (err.message ?? 'Network request failed'),
    );
  }

  return parseAnalyzeResponse(response);
}
