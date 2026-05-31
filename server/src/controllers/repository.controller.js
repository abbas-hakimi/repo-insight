import * as repositoryService from '../services/repository.service.js';

/**
 * POST /repositories/analyze — validate GitHub URL, clone if needed, return metadata.
 */
export async function analyzeRepository(req, res, next) {
  try {
    const { owner, repositoryName, localPath } =
      await repositoryService.analyzeRepository(req.body.githubUrl);

    res.status(200).json({
      success: true,
      owner,
      repositoryName,
      localPath,
    });
  } catch (err) {
    next(err);
  }
}
