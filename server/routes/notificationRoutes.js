const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const verifyToken = require('../middleware/authMiddleware');

// All notification routes require valid JWT authentication
router.use(verifyToken);

// 1. Get user notifications with unread counter
router.get('/', NotificationController.getNotifications);

// 2. Get quick unread count for navbar badge
router.get('/unread-count', NotificationController.getUnreadCount);

// 3. Mark all notifications as read
router.patch('/mark-all-read', NotificationController.markAllAsRead);

// 4. Mark specific notification as read
router.patch('/:id/read', NotificationController.markAsRead);

module.exports = router;
