import { HttpError } from '../utils/httpError.js';

/**
 * Ensures POST /repositories/analyze has a githubUrl string before the controller runs.
 */
export function validateAnalyzeRequest(req, _res, next) {
  const { githubUrl } = req.body ?? {};

  if (!githubUrl || typeof githubUrl !== 'string') {
    return next(new HttpError(400, 'githubUrl is required and must be a string'));
  }

  next();
}
