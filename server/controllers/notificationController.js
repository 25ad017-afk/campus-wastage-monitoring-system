const NotificationModel = require('../models/notificationModel');
const ApiResponse = require('../utils/apiResponse');

class NotificationController {
  /**
   * @route   GET /api/notifications
   * @desc    Get user notifications and unread count
   * @access  Private (Authenticated users)
   */
  static async getNotifications(req, res, next) {
    try {
      const userId = req.user.userId;
      const limit = parseInt(req.query.limit, 10) || 30;

      const [notifications, unreadCount] = await Promise.all([
        NotificationModel.getByUser(userId, limit),
        NotificationModel.getUnreadCount(userId)
      ]);

      return ApiResponse.success(res, 'Notifications retrieved successfully.', {
        unreadCount,
        notifications
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   GET /api/notifications/unread-count
   * @desc    Get unread notifications count for badge
   * @access  Private
   */
  static async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.userId;
      const count = await NotificationModel.getUnreadCount(userId);
      return ApiResponse.success(res, 'Unread count retrieved.', { count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PATCH /api/notifications/:id/read
   * @desc    Mark a specific notification as read
   * @access  Private
   */
  static async markAsRead(req, res, next) {
    try {
      const userId = req.user.userId;
      const notificationId = req.params.id;

      const updated = await NotificationModel.markAsRead(notificationId, userId);
      if (!updated) {
        return ApiResponse.error(res, 'Notification not found or already marked as read.', 404);
      }

      const unreadCount = await NotificationModel.getUnreadCount(userId);
      return ApiResponse.success(res, 'Notification marked as read.', { unreadCount });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @route   PATCH /api/notifications/mark-all-read
   * @desc    Mark all user notifications as read
   * @access  Private
   */
  static async markAllAsRead(req, res, next) {
    try {
      const userId = req.user.userId;
      await NotificationModel.markAllAsRead(userId);

      return ApiResponse.success(res, 'All notifications marked as read.', { unreadCount: 0 });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
