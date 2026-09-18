const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// 1. Create waste report with image (Authenticated users: Student, Staff, Admin)
router.post(
  '/',
  verifyToken,
  upload.single('image'),
  ReportController.createReport
);

// 1b. AI Waste Classification from uploaded photo
router.post(
  '/classify',
  verifyToken,
  upload.single('image'),
  ReportController.classifyWaste
);

// 2. View logged-in user's own reports (Student portal)
router.get(
  '/my-reports',
  verifyToken,
  ReportController.getMyReports
);

// 3. View all reports across campus (Admin & Cleaning Staff with optional query filters)
router.get(
  '/',
  verifyToken,
  authorizeRoles('ADMIN', 'STAFF'),
  ReportController.getAllReports
);

// 4. Get metadata for dropdowns (locations, categories, zones)
router.get(
  '/meta/options',
  verifyToken,
  ReportController.getMetadata
);

// 5. View single report details with images (Owner, Admin, Staff)
router.get(
  '/:id',
  verifyToken,
  ReportController.getReportById
);

// 5. Update report lifecycle status (Admin & Staff)
router.patch(
  '/:id/status',
  verifyToken,
  authorizeRoles('ADMIN', 'STAFF'),
  ReportController.updateReportStatus
);

// 6. Delete report (Admin, or Reporter if status is still 'REPORTED')
router.delete(
  '/:id',
  verifyToken,
  ReportController.deleteReport
);

module.exports = router;
