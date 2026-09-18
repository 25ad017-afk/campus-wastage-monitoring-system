const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token containing userId and role
 * @param {number} userId 
 * @param {string} role 
 * @returns {string} JWT token
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'fallback_secret_for_development',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d', algorithm: 'HS256' }
  );
};

module.exports = generateToken;
