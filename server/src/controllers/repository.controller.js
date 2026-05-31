import * as repositoryService from '../services/repository.service.js';

/**
 * POST /repositories/analyze — validate GitHub URL and return repository metadata.
 */
export function analyzeRepository(req, res, next) {
  try {
    const { owner, repositoryName } = repositoryService.analyzeRepository(
      req.body.githubUrl,
    );

    res.status(200).json({
      success: true,
      owner,
      repositoryName,
    });
  } catch (err) {
    next(err);
  }
}
