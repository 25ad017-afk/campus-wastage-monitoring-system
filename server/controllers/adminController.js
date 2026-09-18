const AdminModel = require('../models/adminModel');
const ReportModel = require('../models/reportModel');
const StaffModel = require('../models/staffModel');
const AssignmentModel = require('../models/assignmentModel');
const NotificationModel = require('../models/notificationModel');
const ApiResponse = require('../utils/apiResponse');

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
}

module.exports = AdminController;
