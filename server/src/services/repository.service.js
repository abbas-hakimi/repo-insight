import { parseGitHubUrl } from '../utils/githubUrl.js';

/**
 * Repository analysis V1 — validate URL and extract owner / repository name.
 */
export function analyzeRepository(githubUrl) {
  const { owner, repo } = parseGitHubUrl(githubUrl);

  return {
    owner,
    repositoryName: repo,
  };
}
