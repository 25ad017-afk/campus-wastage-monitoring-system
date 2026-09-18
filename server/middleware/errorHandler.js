const ApiResponse = require('../utils/apiResponse');

/**
 * Global Express Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error('🔥 Global Error Caught:', err.stack || err.message);

  // Handle JSON parse error (malformed JSON payload)
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return ApiResponse.error(res, 'Invalid JSON payload format in request body.', 400);
  }

  // Handle MySQL Duplicate Entry Error (ER_DUP_ENTRY)
  if (err.code === 'ER_DUP_ENTRY') {
    return ApiResponse.error(res, 'An account with this email address already exists.', 409);
  }

  // Handle Database Connection Errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return ApiResponse.error(res, 'Database connection error. Please verify database server is running.', 503);
  }

  // Handle JWT specific errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid authentication token.', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Authentication token has expired. Please log in again.', 401);
  }

  // Generic fallback: In production, hide internal DB/system error details
  const statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected internal error occurred.';
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'An internal server error occurred. Please contact the administrator.';
  }
  return ApiResponse.error(res, message, statusCode);
};

module.exports = errorHandler;
