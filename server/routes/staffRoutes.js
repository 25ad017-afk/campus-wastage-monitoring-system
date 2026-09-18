const express = require('express');
const router = express.Router();
const StaffController = require('../controllers/staffController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const uploadResolution = require('../middleware/resolutionUploadMiddleware');

// Enforce authentication & STAFF role guard across ALL staff routes (Admins also permitted)
router.use(verifyToken, authorizeRoles('STAFF', 'ADMIN'));

// 1. View assigned waste reports feed (sorted by urgency)
router.get('/tasks', StaffController.getAssignedTasks);

// 2. View full details of a specific assigned task
router.get('/tasks/:id', StaffController.getTaskDetails);

// 3. Accept/Acknowledge an assigned task
router.patch('/tasks/:id/accept', StaffController.acceptTask);

// 4. Mark work as IN_PROGRESS
router.patch('/tasks/:id/start', StaffController.startTask);

// 5. Mark collected, upload "After" proof image, and add remarks
router.post(
  '/tasks/:id/complete',
  uploadResolution.single('image'),
  StaffController.completeTask
);

// 6. View completed tasks history
router.get('/history', StaffController.getCompletedHistory);

// 7. Toggle availability status (Available vs On-Break)
router.patch('/availability', StaffController.toggleAvailability);

module.exports = router;
