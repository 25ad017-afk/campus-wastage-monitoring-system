const express = require('express');
const router = express.Router();
const DemoController = require('../controllers/demoController');

// 1. Seed demo dataset (Students, Staff, 12 Reports, Images, Assignments, Resolutions, Notifications)
router.post('/seed', DemoController.seedDemoData);

// 2. Reset database back to clean baseline state
router.post('/reset', DemoController.resetDemoData);

// 3. Check demo status & report distribution
router.get('/status', DemoController.getDemoStatus);

module.exports = router;
