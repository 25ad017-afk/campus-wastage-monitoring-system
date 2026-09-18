const fs = require('fs');
const AssignmentModel = require('../models/assignmentModel');
const StaffModel = require('../models/staffModel');
const ReportModel = require('../models/reportModel');
const NotificationModel = require('../models/notificationModel');
const ApiResponse = require('../utils/apiResponse');

class StaffController {
  /**
   * Helper: Retrieve the cleaning_staff profile for the currently logged-in user
   */
  static async getStaffProfileOrThrow(userId) {
    const staff = await StaffModel.findByUserId(userId);
    if (!staff) {
      const error = new Error('Cleaning staff profile not found for this user account.');
      error.statusCode = 404;
      throw error;
    }
    return staff;
  }

  /**
   * @route   GET /api/staff/tasks
   * @desc    Get all active assigned waste reports for the logged-in cleaning staff member
   * @access  Private (Staff only)
   */
  static async getAssignedTasks(req, res, next) {
    try {
      const staff = await StaffController.getStaffProfileOrThrow(req.user.userId);
      const { status } = req.query;

      const tasks = await AssignmentModel.getByStaffId(staff.staff_id, status || null);

      return ApiResponse.success(res, 'Assigned tasks retrieved successfully.', {
        staffInfo: {
          staffId: staff.staff_id,
          employeeCode: staff.employee_code,
          assignedZone: staff.assigned_zone,
          isAvailable: staff.is_available
        },
        count: tasks.length,
        tasks
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/staff/tasks/:id
   * @desc    Get complete details of a single assigned task
   * @access  Private (Staff only)
   */
  static async getTaskDetails(req, res, next) {
    try {
      const staff = await StaffController.getStaffProfileOrThrow(req.user.userId);
      const { id } = req.params;

      const task = await AssignmentModel.getTaskById(id, staff.staff_id);
      if (!task) {
        return ApiResponse.error(res, 'Assigned task not found or unauthorized.', 404);
      }

      return ApiResponse.success(res, 'Task details retrieved.', task);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PATCH /api/staff/tasks/:id/accept
   * @desc    Acknowledge/Accept assigned task
   * @access  Private (Staff only)
   */
  static async acceptTask(req, res, next) {
    try {
      const staff = await StaffController.getStaffProfileOrThrow(req.user.userId);
      const { id } = req.params;

      const task = await AssignmentModel.getTaskById(id, staff.staff_id);
      if (!task) {
        return ApiResponse.error(res, 'Task not found or not assigned to you.', 404);
      }

      if (task.assignment_status !== 'ASSIGNED') {
        return ApiResponse.error(
          res,
          `Cannot accept task because it is already '${task.assignment_status}'.`,
          400
        );
      }

      const updated = await AssignmentModel.acknowledge(id, staff.staff_id);
      if (!updated) {
        return ApiResponse.error(res, 'Failed to acknowledge task.', 500);
      }

      const updatedTask = await AssignmentModel.getTaskById(id, staff.staff_id);

      // Trigger notifications for task acceptance
      if (updatedTask && updatedTask.reporter_id) {
        NotificationModel.create({
          recipientId: updatedTask.reporter_id,
          reportId: updatedTask.report_id,
          title: 'Cleanup Task Accepted',
          message: `Staff member ${staff.full_name} has accepted your report #${updatedTask.ticket_code}. Cleaning will begin shortly.`,
          type: 'STATUS_UPDATE'
        });
      }

      NotificationModel.createForAdmins({
        reportId: updatedTask?.report_id,
        title: 'Task Accepted by Crew',
        message: `Staff ${staff.full_name} has accepted ticket #${updatedTask?.ticket_code}.`,
        type: 'STATUS_UPDATE'
      });

      return ApiResponse.success(res, 'Task accepted successfully.', updatedTask);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PATCH /api/staff/tasks/:id/start
   * @desc    Mark work as IN_PROGRESS
   * @access  Private (Staff only)
   */
  static async startTask(req, res, next) {
    try {
      const staff = await StaffController.getStaffProfileOrThrow(req.user.userId);
      const { id } = req.params;

      const task = await AssignmentModel.getTaskById(id, staff.staff_id);
      if (!task) {
        return ApiResponse.error(res, 'Task not found or not assigned to you.', 404);
      }

      if (task.assignment_status === 'COMPLETED') {
        return ApiResponse.error(res, 'Task has already been completed.', 400);
      }

      const started = await AssignmentModel.startWork(id, staff.staff_id);
      if (!started) {
        return ApiResponse.error(res, 'Unable to mark task as in-progress.', 500);
      }

      const updatedTask = await AssignmentModel.getTaskById(id, staff.staff_id);
      return ApiResponse.success(res, 'Task marked as In-Progress. Happy cleaning!', updatedTask);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   POST /api/staff/tasks/:id/complete
   * @desc    Upload completion proof photo, add remarks, and mark waste collected
   * @access  Private (Staff only)
   */
  static async completeTask(req, res, next) {
    try {
      const staff = await StaffController.getStaffProfileOrThrow(req.user.userId);
      const { id } = req.params;
      const { remarks, wasteWeightKg, disposalDestination } = req.body;

      // 1. Validate uploaded proof photo
      if (!req.file) {
        return ApiResponse.error(res, 'A photographic proof ("After" image) of the cleaned area is required.', 400);
      }

      // 2. Validate task existence and ownership
      const task = await AssignmentModel.getTaskById(id, staff.staff_id);
      if (!task) {
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return ApiResponse.error(res, 'Task not found or not assigned to you.', 404);
      }

      if (task.assignment_status === 'COMPLETED') {
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return ApiResponse.error(res, 'This task has already been resolved.', 400);
      }

      // 3. Process image metadata
      const relativeImageUrl = `/uploads/resolutions/${req.file.filename}`;
      const fileSizeKb = Math.round(req.file.size / 1024);

      // 4. Execute atomic database completion
      const completed = await AssignmentModel.completeTask({
        assignmentId: parseInt(id, 10),
        reportId: task.report_id,
        staffId: staff.staff_id,
        afterImageUrl: relativeImageUrl,
        remarks: remarks ? remarks.trim() : null,
        wasteWeightKg: wasteWeightKg ? parseFloat(wasteWeightKg) : null,
        destination: disposalDestination ? disposalDestination.trim() : 'Campus Main Dumpster',
        fileSizeKb
      });

      if (!completed) {
        if (req.file.path && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return ApiResponse.error(res, 'Failed to complete task in database.', 500);
      }

      // 5. Fetch updated report details
      const resolvedReport = await ReportModel.findById(task.report_id);

      // 6. Trigger notifications for task completion
      if (resolvedReport && resolvedReport.reporter_id) {
        NotificationModel.create({
          recipientId: resolvedReport.reporter_id,
          reportId: task.report_id,
          title: 'Waste Cleared & Verified!',
          message: `Your reported waste incident #${resolvedReport.ticket_code} at ${resolvedReport.building_name} has been cleaned with photo proof.`,
          type: 'STATUS_UPDATE'
        });
      }

      NotificationModel.createForAdmins({
        reportId: task.report_id,
        title: 'Cleanup Completed & Photo Uploaded',
        message: `Ticket #${resolvedReport?.ticket_code} at ${resolvedReport?.building_name} was resolved by ${staff.full_name}.`,
        type: 'STATUS_UPDATE'
      });

      return ApiResponse.success(res, 'Task completed successfully! Cleanup proof uploaded.', {
        assignmentId: id,
        report: resolvedReport
      }, 200);
    } catch (error) {
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }

  /**
   * @route   GET /api/staff/history
   * @desc    View all previously completed tasks and collection records
   * @access  Private (Staff only)
   */
  static async getCompletedHistory(req, res, next) {
    try {
      const staff = await StaffController.getStaffProfileOrThrow(req.user.userId);
      const history = await AssignmentModel.getCompletedTasks(staff.staff_id);

      return ApiResponse.success(res, 'Completed tasks history retrieved.', {
        totalResolved: history.length,
        history
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PATCH /api/staff/availability
   * @desc    Toggle staff active/on-break availability
   * @access  Private (Staff only)
   */
  static async toggleAvailability(req, res, next) {
    try {
      const staff = await StaffController.getStaffProfileOrThrow(req.user.userId);
      const { isAvailable } = req.body;

      if (typeof isAvailable !== 'boolean') {
        return ApiResponse.error(res, 'isAvailable must be a boolean (true or false).', 400);
      }

      await StaffModel.updateAvailability(staff.staff_id, isAvailable);

      return ApiResponse.success(res, `Availability updated to ${isAvailable ? 'Available' : 'On-Break'}.`, {
        staffId: staff.staff_id,
        isAvailable
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = StaffController;
