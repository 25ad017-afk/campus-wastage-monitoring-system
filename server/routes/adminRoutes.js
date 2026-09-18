const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

// Enforce authentication & ADMIN role guard across ALL admin routes
router.use(verifyToken, authorizeRoles('ADMIN'));

// 1. Dashboard summary counters & recent incident feed
router.get('/dashboard', AdminController.getDashboard);

// 2. Visual analytics (Waste categories, Hotspot locations, Monthly resolution trends)
router.get('/analytics', AdminController.getAnalytics);

// 3. User directory (List students, staff, admins)
router.get('/users', AdminController.getUsers);

// 4. Cleaning staff roster with current active task workload
router.get('/staff', AdminController.getStaff);

// 5. Multi-criteria filtered reports view (Pending, Completed, High-priority, etc.)
router.get('/reports', AdminController.getFilteredReports);

// 6. Assign a waste report to a cleaning staff member
router.post('/assign', AdminController.assignReport);

// 7. Change priority level of a waste report (Low, Medium, High, Critical)
router.patch('/reports/:id/priority', AdminController.changePriority);

// 8. Change lifecycle status of a report (Reported, Assigned, In_Progress, Resolved, Rejected)
router.patch('/reports/:id/status', AdminController.changeStatus);

module.exports = router;
