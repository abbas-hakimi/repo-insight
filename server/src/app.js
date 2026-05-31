import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import routes from './routes/index.js';

/**
 * Express application setup (middleware + routes).
 * Does not listen on a port — see server.js.
 */
const app = express();

app.use(cors({ origin: env.corsOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(env.apiPrefix, routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
