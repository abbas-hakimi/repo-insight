import { Router } from 'express';
import repositoryRoutes from './repository.routes.js';

/**
 * Root API router — mount feature routers here.
 */
const router = Router();

router.use('/repositories', repositoryRoutes);

export default router;
