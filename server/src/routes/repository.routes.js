import { Router } from 'express';
import * as repositoryController from '../controllers/repository.controller.js';
import { validateAnalyzeRequest } from '../validators/repository.validator.js';

const router = Router();

router.post(
  '/analyze',
  validateAnalyzeRequest,
  repositoryController.analyzeRepository,
);

export default router;
