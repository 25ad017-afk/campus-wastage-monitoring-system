const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const ApiResponse = require('../utils/apiResponse');

// Public Authentication & Email Verification Routes
router.post('/google', AuthController.googleLogin);
router.get('/google-client-id', AuthController.getGoogleClientId);
router.post('/send-otp', AuthController.sendOtp);
router.post('/verify-otp', AuthController.verifyOtp);
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/email-status', AuthController.getEmailStatus);

// Protected Routes (Requires JWT)
router.get('/me', verifyToken, AuthController.getMe);

// Role-Based Authorization Test Routes (Useful for testing & viva demonstration)
router.get('/admin-test', verifyToken, authorizeRoles('ADMIN'), (req, res) => {
  return ApiResponse.success(res, 'Access granted: Welcome to the protected Admin Area.', {
    user: req.user
  });
});

router.get('/staff-test', verifyToken, authorizeRoles('STAFF', 'ADMIN'), (req, res) => {
  return ApiResponse.success(res, 'Access granted: Welcome to the Cleaning Staff Portal.', {
    user: req.user
  });
});

module.exports = router;
