import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

async function start() {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port} (${env.nodeEnv})`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
