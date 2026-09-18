const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/apiResponse');
const userModel = require('../models/userModel');

/**
 * Middleware to authenticate requests using Bearer JWT tokens
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return ApiResponse.error(res, 'Access denied. Malformed token.', 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_for_development',
      { algorithms: ['HS256'] }
    );

    // Fetch user from DB to ensure account is active
    const user = await userModel.findById(decoded.userId);

    if (!user) {
      return ApiResponse.error(res, 'User associated with this token no longer exists.', 401);
    }

    if (!user.is_active) {
      return ApiResponse.error(res, 'Your account has been deactivated. Contact admin.', 403);
    }

    // Attach user object to request
    req.user = {
      userId: user.user_id,
      fullName: user.full_name,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.error(res, 'Token expired. Please login again.', 401);
    }
    return ApiResponse.error(res, 'Invalid authentication token.', 401);
  }
};

module.exports = verifyToken;
