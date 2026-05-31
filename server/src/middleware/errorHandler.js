/**
 * Centralized error response handler.
 */
export function errorHandler(err, _req, res, _next) {
  const status = err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
