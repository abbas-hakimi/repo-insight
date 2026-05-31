/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(_req, res) {
  res.status(404).json({
    success: false,
    message: 'Resource not found',
  });
}
