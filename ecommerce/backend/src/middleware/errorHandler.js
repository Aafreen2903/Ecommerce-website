// src/middleware/errorHandler.js
// Centralized error handling middleware for the Express backend

module.exports = (err, req, res, next) => {
  console.error('⚠️ Error:', err);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    error: message,
    // In production you might hide stack traces
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
