const bcrypt = require('bcryptjs');
const UserModel = require('../models/userModel');
const StaffModel = require('../models/staffModel');
const OtpModel = require('../models/otpModel');
const emailService = require('../services/emailService');
const generateToken = require('../utils/generateToken');
const ApiResponse = require('../utils/apiResponse');

// Domain and Authorization helpers
const getCollegeDomains = () => {
  const studentDomain = (process.env.STUDENT_EMAIL_DOMAIN || '@acetcbe.edu.in').toLowerCase().trim();
  const staffDomain = (process.env.STAFF_EMAIL_DOMAIN || '@acetcbe.edu.in').toLowerCase().trim();
  return { studentDomain, staffDomain };
};

const validateEmailFormat = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const isGenericPublicEmail = (email) => {
  const genericDomains = ['@gmail.com', '@yahoo.com', '@outlook.com', '@hotmail.com', '@icloud.com', '@rediffmail.com'];
  const lower = email.toLowerCase();
  return genericDomains.some(d => lower.endsWith(d));
};

class AuthController {
  /**
   * @route   POST /api/auth/send-otp
   * @desc    Send 6-digit verification OTP to authorized college email
   * @access  Public
   */
  static async sendOtp(req, res, next) {
    try {
      const { email, role = 'STUDENT' } = req.body;

      if (!email) {
        return ApiResponse.error(res, 'Please provide your college email address.', 400);
      }

      const normalizedEmail = email.trim().toLowerCase();
      if (!validateEmailFormat(normalizedEmail)) {
        return ApiResponse.error(res, 'Please provide a valid email format.', 400);
      }

      const { studentDomain, staffDomain } = getCollegeDomains();
      const normalizedRole = role.toUpperCase();

      if (!['STUDENT', 'STAFF', 'ADMIN'].includes(normalizedRole)) {
        return ApiResponse.error(res, 'Invalid role specified.', 400);
      }

      // Disallow random public email services unless authorized
      if (isGenericPublicEmail(normalizedEmail)) {
        return ApiResponse.error(
          res,
          'Unauthorized domain: Please use your official Akshaya College email address (@acetcbe.edu.in).',
          400
        );
      }

      // Role-specific validation
      if (normalizedRole === 'STUDENT') {
        if (!normalizedEmail.endsWith(studentDomain)) {
          return ApiResponse.error(
            res,
            `Student login requires an authorized college student email address ending with ${studentDomain}.`,
            400
          );
        }
      } else if (normalizedRole === 'STAFF') {
        if (!normalizedEmail.endsWith(staffDomain)) {
          return ApiResponse.error(
            res,
            `Staff login requires an authorized college faculty/staff email address ending with ${staffDomain}.`,
            400
          );
        }

        // Staff authorization check: verify if staff email is pre-registered or authorized
        const staffAccount = await UserModel.isStaffAuthorized(normalizedEmail);
        const existingUser = await UserModel.findByEmail(normalizedEmail);

        if (existingUser && existingUser.role === 'STUDENT') {
          return ApiResponse.error(
            res,
            'Unauthorized: This account is registered as a Student. Please switch to the Student Login tab.',
            403
          );
        }

        if (!staffAccount && !normalizedEmail.includes('staff') && !normalizedEmail.includes('admin') && !normalizedEmail.includes('faculty')) {
          return ApiResponse.error(
            res,
            'Unauthorized Staff Email: This address is not found in the authorized staff registry. Please contact campus administration.',
            403
          );
        }
      }

      // Check resend cooldown
      const cooldownCheck = OtpModel.canSend(normalizedEmail, normalizedRole);
      if (!cooldownCheck.allowed) {
        return ApiResponse.error(res, cooldownCheck.message, 429);
      }

      // Check if SMTP is configured
      if (!emailService.isConfigured || !emailService.transporter) {
        return ApiResponse.error(
          res,
          'Email service is not configured. Please configure EMAIL_USER and EMAIL_PASSWORD in server/.env.',
          503,
          { emailConfigured: false }
        );
      }

      // Generate 6-digit OTP
      const otp = emailService.constructor.generateOtp();

      // Fetch recipient name if exists
      const existingUser = await UserModel.findByEmail(normalizedEmail);
      const recipientName = existingUser ? existingUser.full_name : 'Campus Member';

      // Send verification email via Nodemailer SMTP
      const mailResult = await emailService.sendOtpEmail({
        to: normalizedEmail,
        otp,
        role: normalizedRole,
        recipientName
      });

      if (!mailResult || !mailResult.success) {
        return ApiResponse.error(
          res,
          mailResult?.error || 'Unable to send verification email. Please check your SMTP configuration.',
          500,
          { emailConfigured: true, error: 'SMTP_FAILED' }
        );
      }

      // Save OTP only after email dispatch succeeds
      OtpModel.saveOtp({ email: normalizedEmail, otp, role: normalizedRole });

      return ApiResponse.success(res, 'OTP sent successfully to your official college email.', {
        email: normalizedEmail,
        role: normalizedRole,
        emailConfigured: true,
        expiresInMinutes: 10,
        cooldownSeconds: 60
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/verify-otp
   * @desc    Verify 6-digit OTP code entered by user
   * @access  Public
   */
  static async verifyOtp(req, res, next) {
    try {
      const { email, otp, role = 'STUDENT' } = req.body;

      if (!email || !otp) {
        return ApiResponse.error(res, 'Please provide both email and verification code.', 400);
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedRole = role.toUpperCase();
      const trimmedOtp = String(otp).trim();

      if (!/^\d{6}$/.test(trimmedOtp)) {
        return ApiResponse.error(res, 'Verification code must be a 6-digit number.', 400);
      }

      const verification = OtpModel.verifyOtp({
        email: normalizedEmail,
        inputOtp: trimmedOtp,
        role: normalizedRole
      });

      if (!verification.success) {
        return ApiResponse.error(res, verification.message, 400);
      }

      // Check if user exists in DB
      let user = await UserModel.findByEmail(normalizedEmail);
      if (user) {
        await UserModel.markEmailVerified(user.user_id);
      }

      return ApiResponse.success(res, 'Email verified successfully.', {
        email: normalizedEmail,
        role: normalizedRole,
        verified: true,
        userExists: !!user
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/login
   * @desc    Authenticate user with credentials & mandatory Email OTP verification
   * @access  Public
   */
  static async login(req, res, next) {
    try {
      const { email, password, role = 'STUDENT', otp } = req.body;

      if (!email || !password) {
        return ApiResponse.error(res, 'Please provide both email and password.', 400);
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedRole = role.toUpperCase();

      if (!validateEmailFormat(normalizedEmail)) {
        return ApiResponse.error(res, 'Please provide a valid college email address.', 400);
      }

      // Check generic emails
      if (isGenericPublicEmail(normalizedEmail)) {
        return ApiResponse.error(res, 'Please use your official Akshaya College email address (@acetcbe.edu.in).', 400);
      }

      // Find user
      const user = await UserModel.findByEmail(normalizedEmail);
      if (!user) {
        return ApiResponse.error(res, 'Invalid email or password credentials.', 401);
      }

      if (!user.is_active) {
        return ApiResponse.error(res, 'This account has been deactivated. Please contact campus admin.', 403);
      }

      // Role Check: prevent student from logging in as staff
      if (normalizedRole === 'STAFF') {
        if (user.role === 'STUDENT') {
          return ApiResponse.error(
            res,
            'Unauthorized: Student accounts cannot access the Staff Portal. Please switch to the Student Login tab.',
            403
          );
        }
      } else if (normalizedRole === 'STUDENT') {
        if (user.role === 'STAFF') {
          return ApiResponse.error(
            res,
            'This is a Staff account. Please switch to the Staff Login tab to access the Staff Portal.',
            403
          );
        }
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return ApiResponse.error(res, 'Invalid email or password credentials.', 401);
      }

      // Mandatory OTP Verification Check
      const alreadyVerified = OtpModel.consumeVerifiedStatus(normalizedEmail, normalizedRole);
      if (!alreadyVerified) {
        if (!otp || String(otp).trim() === '') {
          return ApiResponse.error(
            res,
            'OTP verification is mandatory. Please enter the 6-digit verification code sent to your official college email.',
            401,
            { otpRequired: true }
          );
        }

        const trimmedOtp = String(otp).trim();
        if (!/^\d{6}$/.test(trimmedOtp)) {
          return ApiResponse.error(res, 'Verification code must be a 6-digit number.', 400);
        }

        const verifyRes = OtpModel.verifyOtp({
          email: normalizedEmail,
          inputOtp: trimmedOtp,
          role: normalizedRole
        });

        if (!verifyRes.success) {
          return ApiResponse.error(res, verifyRes.message || 'Invalid or expired OTP verification code.', 401, {
            reason: verifyRes.reason
          });
        }

        // Consume verified status to prevent any replay
        OtpModel.consumeVerifiedStatus(normalizedEmail, normalizedRole);
      }

      // Mark email verified in DB
      await UserModel.markEmailVerified(user.user_id);

      // Fetch staff profile if applicable
      let staffProfile = null;
      if (user.role === 'STAFF') {
        staffProfile = await StaffModel.findByUserId(user.user_id);
      }

      // Generate JWT only after credentials AND OTP are verified
      const token = generateToken(user.user_id, user.role);

      return ApiResponse.success(res, 'Login successful.', {
        user: {
          userId: user.user_id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          phoneNumber: user.phone_number,
          isEmailVerified: true,
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
   * @route   POST /api/auth/register
   * @desc    Register a new user with mandatory email verification
   * @access  Public
   */
  static async register(req, res, next) {
    try {
      const { fullName, email, password, role = 'STUDENT', phoneNumber, employeeCode, assignedZone, otp } = req.body;

      if (!fullName || !email || !password) {
        return ApiResponse.error(res, 'Please provide fullName, email, and password.', 400);
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedRole = role.toUpperCase();
      const { studentDomain, staffDomain } = getCollegeDomains();

      if (!validateEmailFormat(normalizedEmail)) {
        return ApiResponse.error(res, 'Please provide a valid email address.', 400);
      }

      if (isGenericPublicEmail(normalizedEmail)) {
        return ApiResponse.error(res, 'Please use your official ACET college email address (@acetcbe.edu.in).', 400);
      }

      if (normalizedRole === 'STUDENT' && !normalizedEmail.endsWith(studentDomain)) {
        return ApiResponse.error(res, `Please use your official student email ending in ${studentDomain}.`, 400);
      }

      if (normalizedRole === 'STAFF' && !normalizedEmail.endsWith(staffDomain)) {
        return ApiResponse.error(res, `Please use your official staff email ending in ${staffDomain}.`, 400);
      }

      if (password.length < 6) {
        return ApiResponse.error(res, 'Password must be at least 6 characters long.', 400);
      }

      // Check existing user
      const existingUser = await UserModel.findByEmail(normalizedEmail);
      if (existingUser) {
        return ApiResponse.error(res, 'A user with this email address already exists.', 409);
      }

      // Mandatory OTP Verification Check
      const alreadyVerified = OtpModel.consumeVerifiedStatus(normalizedEmail, normalizedRole);
      if (!alreadyVerified) {
        if (!otp || String(otp).trim() === '') {
          return ApiResponse.error(
            res,
            'OTP verification is mandatory for registration. Please enter the 6-digit verification code sent to your official college email.',
            400,
            { otpRequired: true }
          );
        }

        const trimmedOtp = String(otp).trim();
        if (!/^\d{6}$/.test(trimmedOtp)) {
          return ApiResponse.error(res, 'Verification code must be a 6-digit number.', 400);
        }

        const verifyRes = OtpModel.verifyOtp({
          email: normalizedEmail,
          inputOtp: trimmedOtp,
          role: normalizedRole
        });

        if (!verifyRes.success) {
          return ApiResponse.error(res, verifyRes.message || 'Invalid or expired OTP verification code.', 400, {
            reason: verifyRes.reason
          });
        }

        OtpModel.consumeVerifiedStatus(normalizedEmail, normalizedRole);
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const userId = await UserModel.create({
        fullName,
        email: normalizedEmail,
        passwordHash,
        role: normalizedRole,
        phoneNumber: phoneNumber || null,
        isEmailVerified: true
      });

      // If staff, create profile
      let staffId = null;
      if (normalizedRole === 'STAFF') {
        const generatedCode = employeeCode || `STF-${Date.now().toString().slice(-4)}`;
        staffId = await StaffModel.create({
          userId,
          employeeCode: generatedCode,
          assignedZone: assignedZone || 'General Campus'
        });
      }

      const token = generateToken(userId, normalizedRole);

      return ApiResponse.success(res, 'Registration successful.', {
        user: {
          userId,
          fullName,
          email: normalizedEmail,
          role: normalizedRole,
          phoneNumber: phoneNumber || null,
          isEmailVerified: true,
          staffId,
          assignedZone: assignedZone || null
        },
        token
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/auth/me
   * @desc    Get currently logged-in user profile
   * @access  Private (Requires valid JWT)
   */
  
  /**
   * @route   GET /api/auth/email-status
   * @desc    Get SMTP configuration status without exposing sensitive credentials
   * @access  Public
   */
  static async getEmailStatus(req, res, next) {
    try {
      const emailStatus = emailService.getStatus();

      return ApiResponse.success(res, 'Email service status retrieved.', {
        status: emailStatus.status,
        isConfigured: emailStatus.isConfigured,
        mode: emailStatus.isConfigured ? 'REAL_SMTP_DISPATCH' : 'UNCONFIGURED',
        host: emailStatus.host,
        port: emailStatus.port,
        secure: emailStatus.secure,
        senderAccount: emailStatus.senderAccount,
        studentDomain: emailStatus.studentDomain,
        staffDomain: emailStatus.staffDomain,
        instruction: emailStatus.isConfigured
          ? 'Real Nodemailer SMTP email dispatch is active.'
          : 'SMTP credentials are not configured. To send real OTP emails, set EMAIL_USER and EMAIL_PASSWORD in server/.env.'
      });
    } catch (error) {
      next(error);
    }
  }

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
        isEmailVerified: !!user.is_email_verified,
        staffId: staffProfile ? staffProfile.staff_id : null,
        assignedZone: staffProfile ? staffProfile.assigned_zone : null
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
