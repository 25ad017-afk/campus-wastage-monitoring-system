const ApiResponse = require('../utils/apiResponse');

/**
 * Middleware factory to enforce Role-Based Access Control (RBAC)
 * @param  {...string} allowedRoles Roles permitted to access the route ('STUDENT', 'STAFF', 'ADMIN')
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return ApiResponse.error(res, 'Access denied. User role not determined.', 403);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return ApiResponse.error(
        res,
        `Access forbidden. Requires one of these roles: [${allowedRoles.join(', ')}]. Your role: ${req.user.role}`,
        403
      );
    }

    next();
  };
};

module.exports = authorizeRoles;
