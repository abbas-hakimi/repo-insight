import * as repositoryService from '../services/repository.service.js';

/**
 * POST /repositories/analyze — validate GitHub URL, clone if needed, return metadata.
 */
export async function analyzeRepository(req, res, next) {
  try {
    const {
      owner,
      repositoryName,
      localPath,
      statistics,
      fileTree,
      fileTreeMeta,
      dependencyGraph,
      graphMeta,
    } = await repositoryService.analyzeRepository(req.body.githubUrl);

    res.status(200).json({
      success: true,
      owner,
      repositoryName,
      localPath,
      statistics,
      fileTree,
      fileTreeMeta,
      dependencyGraph,
      graphMeta,
    });
  } catch (err) {
    next(err);
  }
}
