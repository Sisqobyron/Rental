const express = require('express');
const DashboardController = require('../controllers/dashboardController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticateToken, requireRole('landlord'), DashboardController.getStats);
router.get('/monthly-summary', authenticateToken, requireRole('landlord'), DashboardController.getMonthlySummary);

module.exports = router;
