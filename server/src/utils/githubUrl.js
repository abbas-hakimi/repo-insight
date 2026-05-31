import { HttpError } from './httpError.js';

const GITHUB_REPO_PATTERN =
  /^https?:\/\/(?:www\.)?github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+?)(?:\.git)?\/?$/;

/**
 * Validates and parses a public GitHub repository URL.
 * @returns {{ owner: string, repo: string, cloneUrl: string }}
 */
export function parseGitHubUrl(input) {
  if (!input || typeof input !== 'string') {
    throw new HttpError(400, 'githubUrl is required and must be a string');
  }

  const trimmed = input.trim();

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new HttpError(400, 'githubUrl must be a valid URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new HttpError(400, 'githubUrl must use http or https');
  }

  if (!parsed.hostname.endsWith('github.com') || parsed.hostname === 'gist.github.com') {
    throw new HttpError(400, 'githubUrl must point to a github.com repository');
  }

  const normalized = `${parsed.protocol}//github.com${parsed.pathname.replace(/\/$/, '')}`;
  const match = normalized.match(GITHUB_REPO_PATTERN);

  if (!match) {
    throw new HttpError(
      400,
      'githubUrl must match https://github.com/{owner}/{repository}',
    );
  }

  const [, owner, repo] = match;

  return {
    owner,
    repo,
    cloneUrl: `https://github.com/${owner}/${repo}.git`,
  };
}
