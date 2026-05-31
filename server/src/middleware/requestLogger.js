/**
 * Logs analyze (and other) requests so restarts can be correlated with in-flight traffic.
 */
export function requestLogger(req, res, next) {
  const start = performance.now();
  const label = `${req.method} ${req.originalUrl}`;

  console.log(`[request] start ${label}`);

  res.on('finish', () => {
    const durationMs = Math.round(performance.now() - start);
    console.log(`[request] end ${label} ${res.statusCode} ${durationMs}ms`);
  });

  res.on('close', () => {
    if (!res.writableEnded) {
      const durationMs = Math.round(performance.now() - start);
      console.log(`[request] connection closed early ${label} ${durationMs}ms`);
    }
  });

  next();
}
