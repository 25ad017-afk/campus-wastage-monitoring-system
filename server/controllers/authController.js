const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const StaffModel = require('../models/staffModel');
const generateToken = require('../utils/generateToken');
const ApiResponse = require('../utils/apiResponse');

class AuthController {
  /**
   * @route   POST /api/auth/register
   * @desc    Register a new user (Student, Staff, or Admin)
   * @access  Public
   */
  static async register(req, res, next) {
    try {
      const { fullName, email, password, role = 'STUDENT', phoneNumber, employeeCode, assignedZone } = req.body;

      // 1. Basic validation
      if (!fullName || !email || !password) {
        return ApiResponse.error(res, 'Please provide fullName, email, and password.', 400);
      }

      // Email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ApiResponse.error(res, 'Please provide a valid email address.', 400);
      }

      // Official ACET college email domain check (case-insensitive)
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail.endsWith('@acetcbe.edu.in')) {
        return ApiResponse.error(res, 'Please use your official ACET college email address.', 400);
      }

      // Password length check
      if (password.length < 6) {
        return ApiResponse.error(res, 'Password must be at least 6 characters long.', 400);
      }

      const allowedRoles = ['STUDENT', 'STAFF', 'ADMIN'];
      if (!allowedRoles.includes(role)) {
        return ApiResponse.error(res, `Role must be one of: ${allowedRoles.join(', ')}`, 400);
      }

      // 2. Check if user already exists
      const existingUser = await UserModel.findByEmail(normalizedEmail);
      if (existingUser) {
        return ApiResponse.error(res, 'A user with this email address already exists.', 409);
      }

      // 3. Hash password using bcrypt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // 4. Create user in database
      const userId = await UserModel.create({
        fullName,
        email: normalizedEmail,
        passwordHash,
        role,
        phoneNumber: phoneNumber || null
      });

      // 5. If registering cleaning staff, create staff profile record
      if (role === 'STAFF') {
        const generatedCode = employeeCode || `STF-${Date.now().toString().slice(-4)}`;
        await StaffModel.create({
          userId,
          employeeCode: generatedCode,
          assignedZone: assignedZone || 'General Campus'
        });
      }

      // 6. Generate JWT token
      const token = generateToken(userId, role);

      // 7. Return success response
      return ApiResponse.success(res, 'Registration successful.', {
        user: {
          userId,
          fullName,
          email,
          role,
          phoneNumber: phoneNumber || null
        },
        token
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/login
   * @desc    Authenticate user and get JWT token
   * @access  Public
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 1. Validation
      if (!email || !password) {
        return ApiResponse.error(res, 'Please provide both email and password.', 400);
      }

      // Official ACET college email domain check (case-insensitive)
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail.endsWith('@acetcbe.edu.in')) {
        return ApiResponse.error(res, 'Please use your official ACET college email address.', 400);
      }

      // 2. Check user existence
      const user = await UserModel.findByEmail(normalizedEmail);
      if (!user) {
        return ApiResponse.error(res, 'Invalid email or password credentials.', 401);
      }

      // 3. Check if account is active
      if (!user.is_active) {
        return ApiResponse.error(res, 'This account has been deactivated. Please contact campus admin.', 403);
      }

      // 4. Compare passwords
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return ApiResponse.error(res, 'Invalid email or password credentials.', 401);
      }

      // 5. If user is cleaning staff, fetch their staff_id
      let staffProfile = null;
      if (user.role === 'STAFF') {
        staffProfile = await StaffModel.findByUserId(user.user_id);
      }

      // 6. Generate token
      const token = generateToken(user.user_id, user.role);

      return ApiResponse.success(res, 'Login successful.', {
        user: {
          userId: user.user_id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phone_number,
          staffId: staffProfile ? staffProfile.staff_id : null,
          assignedZone: staffProfile ? staffProfile.assigned_zone : null
        },
        token
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/auth/me
   * @desc    Get currently logged-in user profile
   * @access  Private (Requires valid JWT)
   */
  static async getMe(req, res, next) {
    try {
      const user = await UserModel.findById(req.user.userId);
      if (!user) {
        return ApiResponse.error(res, 'User not found.', 404);
      }

      let staffProfile = null;
      if (user.role === 'STAFF') {
        staffProfile = await StaffModel.findByUserId(user.user_id);
      }

      return ApiResponse.success(res, 'User profile retrieved.', {
        userId: user.user_id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phone_number,
        staffId: staffProfile ? staffProfile.staff_id : null,
        assignedZone: staffProfile ? staffProfile.assigned_zone : null
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
