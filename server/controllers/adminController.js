const fs = require('fs');
const path = require('path');
const AdminModel = require('../models/adminModel');
const ReportModel = require('../models/reportModel');
const StaffModel = require('../models/staffModel');
const AssignmentModel = require('../models/assignmentModel');
const NotificationModel = require('../models/notificationModel');
const ApiResponse = require('../utils/apiResponse');
const emailService = require('../services/emailService');

class AdminController {
  /**
   * @route   GET /api/admin/dashboard
   * @desc    Get overall admin dashboard overview (counters, staff availability, and recent activity)
   * @access  Private (Admin only)
   */
  static async getDashboard(req, res, next) {
    try {
      const [stats, recentReports] = await Promise.all([
        AdminModel.getDashboardStats(),
        AdminModel.getRecentReports(8)
      ]);

      return ApiResponse.success(res, 'Admin dashboard summary retrieved successfully.', {
        stats,
        recentReports
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/admin/analytics
   * @desc    Get detailed multi-dimensional analytics (Daily, Weekly, Monthly, Category, Location, Completed vs Pending, Staff Performance, Avg Resolution Time)
   * @access  Private (Admin only)
   */
  static async getAnalytics(req, res, next) {
    try {
      const { timeframe = 'ALL', startDate, endDate } = req.query;
      const analytics = await AdminModel.getFullAnalytics({
        timeframe: String(timeframe).toUpperCase(),
        startDate,
        endDate
      });
      return ApiResponse.success(res, 'Comprehensive analytics data retrieved successfully.', analytics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/admin/users
   * @desc    Get list of all campus users with optional role filtering
   * @access  Private (Admin only)
   */
  static async getUsers(req, res, next) {
    try {
      const { role } = req.query;
      const users = await AdminModel.getAllUsers(role);
      return ApiResponse.success(res, 'User directory retrieved successfully.', users);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/admin/staff
   * @desc    Get all cleaning staff with current active workload count
   * @access  Private (Admin only)
   */
  static async getStaff(req, res, next) {
    try {
      const staffList = await AdminModel.getCleaningStaffWorkload();
      return ApiResponse.success(res, 'Cleaning staff roster retrieved successfully.', staffList);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/admin/assign
   * @desc    Assign a waste incident report to a cleaning staff member
   * @access  Private (Admin only)
   */
  static async assignReport(req, res, next) {
    try {
      const { reportId, staffId, adminNotes } = req.body;

      if (!reportId || !staffId) {
        return ApiResponse.error(res, 'Both reportId and staffId are required.', 400);
      }

      // 1. Verify report exists and is not already resolved
      const report = await ReportModel.findById(reportId);
      if (!report) {
        return ApiResponse.error(res, 'Waste report not found.', 404);
      }

      if (report.status === 'RESOLVED') {
        return ApiResponse.error(res, 'Cannot assign a report that is already marked as RESOLVED.', 400);
      }

      // 2. Verify cleaning staff exists
      const staff = await StaffModel.findById(staffId);
      if (!staff) {
        return ApiResponse.error(res, 'Cleaning staff member not found.', 404);
      }

      // 3. Create assignment via transactional Model
      const assignmentId = await AssignmentModel.create({
        reportId: parseInt(reportId, 10),
        staffId: parseInt(staffId, 10),
        assignedBy: req.user.userId,
        adminNotes: adminNotes ? adminNotes.trim() : null
      });

      // 4. Return updated report details
      const updatedReport = await ReportModel.findById(reportId);

      // 5. Trigger notifications for staff and reporter
      if (staff && staff.user_id) {
        NotificationModel.create({
          recipientId: staff.user_id,
          reportId: parseInt(reportId, 10),
          title: 'New Task Assigned',
          message: `You have been assigned ticket #${updatedReport?.ticket_code} at ${updatedReport?.building_name}. Priority: ${updatedReport?.priority}.`,
          type: 'TASK_ASSIGNED'
        });
      }

      if (updatedReport && updatedReport.reporter_id) {
        NotificationModel.create({
          recipientId: updatedReport.reporter_id,
          reportId: parseInt(reportId, 10),
          title: 'Cleaning Task Dispatched',
          message: `Your report #${updatedReport.ticket_code} has been assigned to staff member ${staff.full_name}.`,
          type: 'TASK_ASSIGNED'
        });
      }

      // 6. Send Action Confirmation Email to Assigned Staff (YES to accept/start, NO to decline)
      if (staff && staff.email) {
        try {
          const baseUrl = process.env.APP_URL 
            || process.env.CLIENT_URL 
            || (req.headers['x-forwarded-host'] ? `${(req.headers['x-forwarded-proto'] || 'http').split(',')[0]}://${req.headers['x-forwarded-host']}` : 'https://campus-wastage-monitoring-system.vercel.app');

          emailService.sendActionConfirmationEmail({
            to: staff.email,
            recipientName: staff.full_name || 'Staff Member',
            report: updatedReport,
            actionType: 'STAFF_ASSIGNMENT',
            baseUrl: baseUrl.replace(/\/$/, '')
          }).catch(err => console.warn('Staff assignment action email non-critical warning:', err.message));
        } catch (emailErr) {
          console.warn('Staff action confirmation email error:', emailErr.message);
        }
      }

      return ApiResponse.success(res, `Task successfully dispatched to ${staff.full_name}.`, {
        assignmentId,
        staff: {
          staffId: staff.staff_id,
          name: staff.full_name,
          employeeCode: staff.employee_code
        },
        report: updatedReport
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PATCH /api/admin/reports/:id/priority
   * @desc    Change urgency priority level of a waste report
   * @access  Private (Admin only)
   */
  static async changePriority(req, res, next) {
    try {
      const { id } = req.params;
      const { priority } = req.body;

      if (!priority) {
        return ApiResponse.error(res, 'Priority field is required.', 400);
      }

      const allowedPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
      const sanitizedPriority = priority.toUpperCase();

      if (!allowedPriorities.includes(sanitizedPriority)) {
        return ApiResponse.error(res, `Priority must be one of: ${allowedPriorities.join(', ')}`, 400);
      }

      const report = await ReportModel.findById(id);
      if (!report) {
        return ApiResponse.error(res, 'Report not found.', 404);
      }

      await AdminModel.updatePriority(id, sanitizedPriority);
      const updatedReport = await ReportModel.findById(id);

      return ApiResponse.success(res, `Report #${report.ticket_code} priority updated to ${sanitizedPriority}.`, updatedReport);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PATCH /api/admin/reports/:id/status
   * @desc    Change lifecycle status of a report (e.g. override, reject or approve)
   * @access  Private (Admin only)
   */
  static async changeStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return ApiResponse.error(res, 'Status field is required.', 400);
      }

      const allowedStatuses = ['REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
      const sanitizedStatus = status.toUpperCase();

      if (!allowedStatuses.includes(sanitizedStatus)) {
        return ApiResponse.error(res, `Status must be one of: ${allowedStatuses.join(', ')}`, 400);
      }

      const report = await ReportModel.findById(id);
      if (!report) {
        return ApiResponse.error(res, 'Report not found.', 404);
      }

      await ReportModel.updateStatus(id, sanitizedStatus);
      const updatedReport = await ReportModel.findById(id);

      // Trigger notification to student reporter
      if (updatedReport && updatedReport.reporter_id) {
        NotificationModel.create({
          recipientId: updatedReport.reporter_id,
          reportId: parseInt(id, 10),
          title: 'Report Status Updated',
          message: `Your ticket #${updatedReport.ticket_code} status was updated to ${sanitizedStatus} by the Administrator.`,
          type: 'STATUS_UPDATE'
        });
      }

      return ApiResponse.success(res, `Report #${report.ticket_code} status changed to ${sanitizedStatus}.`, updatedReport);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/admin/reports
   * @desc    Get reports with multi-criteria filtering for admin tables
   * @access  Private (Admin only)
   */
  static async getFilteredReports(req, res, next) {
    try {
      const { status, priority, zoneName } = req.query;

      const reports = await ReportModel.getAll({
        status: status ? status.toUpperCase() : null,
        priority: priority ? priority.toUpperCase() : null,
        zoneName: zoneName || null
      });

      return ApiResponse.success(res, 'Filtered reports list retrieved.', {
        count: reports.length,
        reports
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/admin/smtp-status
   * @desc    Get detailed SMTP status and configuration for facilities administrator
   * @access  Private (Admin only)
   */
  static async getSmtpStatus(req, res, next) {
    try {
      const isConfigured = emailService.isConfigured;
      const host = (process.env.EMAIL_HOST || 'smtp.gmail.com').trim();
      const defaultPort = (host === 'smtp.gmail.com') ? 465 : 587;
      const port = parseInt(process.env.EMAIL_PORT || defaultPort, 10);
      const user = (process.env.EMAIL_USER || '').trim();
      const from = (process.env.EMAIL_FROM || user || '').trim();
      const secure = process.env.EMAIL_SECURE !== undefined
        ? (process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_SECURE === '1')
        : (port === 465 || host === 'smtp.gmail.com');

      // Mask user email for privacy (never expose password)
      let maskedUser = 'Not configured';
      if (user) {
        const parts = user.split('@');
        if (parts.length === 2) {
          const namePart = parts[0];
          const maskedName = namePart.length > 3 ? namePart.slice(0, 2) + '***' + namePart.slice(-1) : namePart[0] + '***';
          maskedUser = maskedName + '@' + parts[1];
        } else {
          maskedUser = user.slice(0, 2) + '***';
        }
      }

      return ApiResponse.success(res, 'SMTP status retrieved.', {
        status: isConfigured ? 'Configured' : 'Not Configured',
        isConfigured,
        host,
        port,
        secure,
        senderAccount: isConfigured ? maskedUser : 'Not configured',
        fromAddress: from ? (from.includes('@') ? from.replace(/^(.)(.*)(@.*)$/, '$1***$3') : from) : 'Not configured',
        studentDomain: process.env.STUDENT_EMAIL_DOMAIN || '@acetcbe.edu.in',
        staffDomain: process.env.STAFF_EMAIL_DOMAIN || '@acetcbe.edu.in'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/admin/smtp-config
   * @desc    Securely update SMTP email credentials server-side
   * @access  Private (Admin only)
   */
  static async updateSmtpConfig(req, res, next) {
    try {
      const { emailHost, emailPort, emailUser, emailPassword, emailFrom, emailSecure } = req.body;

      if (!emailUser || !emailPassword) {
        return ApiResponse.error(res, 'Both Sender Email Address and App Password are required.', 400);
      }

      const host = (emailHost || 'smtp.gmail.com').trim();
      const port = String(emailPort || '587').trim();
      const user = emailUser.trim();
      const pass = emailPassword.trim();
      const from = (emailFrom || user).trim();
      const secure = emailSecure ? 'true' : 'false';

      // Update in-memory environment variables
      process.env.EMAIL_HOST = host;
      process.env.EMAIL_PORT = port;
      process.env.EMAIL_USER = user;
      process.env.EMAIL_PASSWORD = pass;
      process.env.EMAIL_FROM = from;
      process.env.EMAIL_SECURE = secure;

      // Safely update server/.env file
      const envPath = path.join(__dirname, '..', '.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf8');

        const updateOrAppend = (key, val) => {
          const regex = new RegExp(`^#?\\s*${key}=.*$`, 'm');
          if (regex.test(envContent)) {
            envContent = envContent.replace(regex, `${key}=${val}`);
          } else {
            envContent += `\n${key}=${val}`;
          }
        };

        updateOrAppend('EMAIL_HOST', host);
        updateOrAppend('EMAIL_PORT', port);
        updateOrAppend('EMAIL_SECURE', secure);
        updateOrAppend('EMAIL_USER', user);
        updateOrAppend('EMAIL_PASSWORD', pass);
        updateOrAppend('EMAIL_FROM', from);

        fs.writeFileSync(envPath, envContent, 'utf8');
      }

      // Re-initialize emailService transporter with new credentials
      emailService.initTransporter();

      return ApiResponse.success(res, 'SMTP credentials updated and live email delivery activated successfully.', {
        status: emailService.isConfigured ? 'Configured' : 'Not Configured',
        isConfigured: emailService.isConfigured,
        host,
        port: parseInt(port, 10)
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
