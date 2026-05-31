import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';

function registerProcessDiagnostics() {
  console.log(`[server] Process starting (pid ${process.pid}, watch=${process.env.NODE_WATCH_PID ? 'yes' : 'no'})`);

  process.on('uncaughtException', (err) => {
    console.error('[server] uncaughtException:', err);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('[server] unhandledRejection:', reason);
  });
}

registerProcessDiagnostics();

async function start() {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.log(`Server listening on port ${env.port} (${env.nodeEnv})`);
    console.log(`[server] Clone directory: ${env.reposCloneDir}`);
  });

  server.requestTimeout = 0;
  server.headersTimeout = 0;
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
