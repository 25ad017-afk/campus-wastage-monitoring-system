const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
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

const isDemoAuthMode = () => {
  const flag = (process.env.DEMO_AUTH_MODE || '').trim().toLowerCase();
  if (flag === 'false' || flag === '0' || flag === 'off' || flag === 'no') {
    return false;
  }
  return true;
};

/**
 * Securely verify Google OAuth ID token using google-auth-library with fallback to Google tokeninfo API
 */
const verifyGoogleIdToken = async (credential) => {
  if (!credential || typeof credential !== 'string') {
    throw new Error('Google credential token is missing or invalid.');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const client = new OAuth2Client(clientId);

  // 1. Try OAuth2Client verifyIdToken if GOOGLE_CLIENT_ID is configured
  if (clientId) {
    try {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId
      });
      const payload = ticket.getPayload();
      if (payload) return payload;
    } catch (err) {
      console.warn('verifyIdToken with audience failed, checking tokeninfo:', err.message);
    }
  }

  // 2. Google OAuth2 tokeninfo validation
  const tokenInfoUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`;
  const response = await fetch(tokenInfoUrl);
  if (!response.ok) {
    throw new Error('Google ID token validation failed or token has expired.');
  }

  const payload = await response.json();

  // Validate issuer
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!validIssuers.includes(payload.iss)) {
    throw new Error('Invalid Google token issuer.');
  }

  // Validate expiration time
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && parseInt(payload.exp, 10) < now) {
    throw new Error('Google authentication session has expired. Please sign in again.');
  }

  return payload;
};

class AuthController {
  /**
   * @route   POST /api/auth/google
   * @desc    Authenticate or register user via official Google Identity Services / OAuth ID token
   * @access  Public
   */
  static async googleLogin(req, res, next) {
    try {
      const { credential, token, role = 'STUDENT' } = req.body;
      const idToken = credential || token;

      if (!idToken) {
        return ApiResponse.error(res, 'Google authentication credential is required.', 400);
      }

      // Securely verify Google ID token
      let payload;
      try {
        payload = await verifyGoogleIdToken(idToken);
      } catch (tokenErr) {
        return ApiResponse.error(res, tokenErr.message || 'Invalid or expired Google authentication token.', 401);
      }

      if (!payload || !payload.email) {
        return ApiResponse.error(res, 'Failed to obtain verified email from Google authentication.', 400);
      }

      const normalizedEmail = String(payload.email).trim().toLowerCase();
      const googleName = payload.name || `${payload.given_name || ''} ${payload.family_name || ''}`.trim() || 'ACET Member';
      const requestedRole = (role || 'STUDENT').toUpperCase();
      const { studentDomain, staffDomain } = getCollegeDomains();

      // Enforce ACET official college account requirement
      if (!normalizedEmail.endsWith(studentDomain) && !normalizedEmail.endsWith(staffDomain)) {
        return ApiResponse.error(
          res,
          'Please use your official ACET college Google account (@acetcbe.edu.in).',
          403,
          { unauthorizedEmail: normalizedEmail }
        );
      }

      // Check if user already exists in CWMS database
      let user = await UserModel.findByEmail(normalizedEmail);

      if (user) {
        if (!user.is_active) {
          return ApiResponse.error(res, 'This account has been deactivated. Please contact campus administration.', 403);
        }

        // Mark email verified in DB
        await UserModel.markEmailVerified(user.user_id);
      } else {
        // Auto-provision new user account for valid ACET member
        let assignedRole = requestedRole;

        if (normalizedEmail === 'admin@acetcbe.edu.in') {
          assignedRole = 'ADMIN';
        } else if (requestedRole === 'STAFF' || normalizedEmail.includes('staff') || normalizedEmail.includes('faculty')) {
          assignedRole = 'STAFF';
        } else {
          assignedRole = 'STUDENT';
        }

        // Generate strong password hash (Google manages actual authentication)
        const randomSecret = crypto.randomBytes(32).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(randomSecret, salt);

        const userId = await UserModel.create({
          fullName: googleName,
          email: normalizedEmail,
          passwordHash,
          role: assignedRole,
          phoneNumber: null,
          isEmailVerified: true
        });

        if (assignedRole === 'STAFF') {
          const generatedCode = `STF-${Date.now().toString().slice(-4)}`;
          await StaffModel.create({
            userId,
            employeeCode: generatedCode,
            assignedZone: 'General Campus'
          });
        }

        user = await UserModel.findById(userId);
      }

      // Fetch staff profile if applicable
      let staffProfile = null;
      if (user.role === 'STAFF') {
        staffProfile = await StaffModel.findByUserId(user.user_id);
      }

      // Generate secure CWMS JWT session token
      const jwtToken = generateToken(user.user_id, user.role);

      return ApiResponse.success(res, 'Google authentication successful.', {
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
        token: jwtToken,
        authProvider: 'google'
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/send-otp
   * @desc    Send 6-digit verification OTP to authorized college email
   * @access  Public
   */
  static async sendOtp(req, res, next) {
    try {
      if (isDemoAuthMode()) {
        return ApiResponse.success(res, 'Demo Auth Mode is active. Email OTP dispatch is bypassed.', {
          demoAuthMode: true,
          emailConfigured: false,
          cooldownSeconds: 0
        }, 200);
      }

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
      emailService.initTransporter();
      if (!emailService.isConfigured || !emailService.transporter) {
        return ApiResponse.error(
          res,
          'Email service is not configured. Please configure EMAIL_USER and EMAIL_PASSWORD in environment variables.',
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
          502,
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

      if (!email) {
        return ApiResponse.error(res, 'Please provide your college email address.', 400);
      }

      const normalizedEmail = email.trim().toLowerCase();
      const normalizedRole = role.toUpperCase();

      if (isDemoAuthMode()) {
        let user = await UserModel.findByEmail(normalizedEmail);
        if (user) {
          await UserModel.markEmailVerified(user.user_id);
        }
        return ApiResponse.success(res, 'Email verified successfully (Demo Mode).', {
          email: normalizedEmail,
          role: normalizedRole,
          verified: true,
          demoAuthMode: true,
          userExists: !!user
        }, 200);
      }

      if (!otp) {
        return ApiResponse.error(res, 'Please provide both email and verification code.', 400);
      }

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
   * @desc    Authenticate user with credentials & mandatory Email OTP verification (bypassed in DEMO_AUTH_MODE)
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

      // Mandatory OTP Verification Check (Only when DEMO_AUTH_MODE is false)
      if (!isDemoAuthMode()) {
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
      }

      // Mark email verified in DB
      await UserModel.markEmailVerified(user.user_id);

      // Fetch staff profile if applicable
      let staffProfile = null;
      if (user.role === 'STAFF') {
        staffProfile = await StaffModel.findByUserId(user.user_id);
      }

      // Generate JWT
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
        token,
        demoAuthMode: isDemoAuthMode()
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/auth/register
   * @desc    Register a new user with mandatory email verification (bypassed in DEMO_AUTH_MODE)
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

      // Mandatory OTP Verification Check (Only when DEMO_AUTH_MODE is false)
      if (!isDemoAuthMode()) {
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
        token,
        demoAuthMode: isDemoAuthMode()
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/auth/email-status
   * @desc    Get SMTP configuration status and Demo Auth Mode flag
   * @access  Public
   */
  static async getEmailStatus(req, res, next) {
    try {
      const demoAuthMode = isDemoAuthMode();
      const emailStatus = emailService.getStatus();

      return ApiResponse.success(res, 'Email service and auth mode status retrieved.', {
        status: emailStatus.status,
        isConfigured: emailStatus.isConfigured,
        demoAuthMode,
        mode: demoAuthMode ? 'DEMO_AUTH_MODE' : (emailStatus.isConfigured ? 'REAL_SMTP_DISPATCH' : 'UNCONFIGURED'),
        host: emailStatus.host,
        port: emailStatus.port,
        secure: emailStatus.secure,
        senderAccount: emailStatus.senderAccount,
        studentDomain: emailStatus.studentDomain,
        staffDomain: emailStatus.staffDomain,
        instruction: demoAuthMode
          ? 'DEMO AUTH MODE ACTIVE: Email OTP verification is bypassed and Google-style YES/NO confirmation is active for presentation.'
          : (emailStatus.isConfigured
            ? 'Real Nodemailer SMTP email dispatch is active.'
            : 'SMTP credentials are not configured. To send real OTP emails, set EMAIL_USER and EMAIL_PASSWORD in environment variables.')
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
