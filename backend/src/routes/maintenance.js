const express = require('express');
const MaintenanceController = require('../controllers/maintenanceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, MaintenanceController.getRequests);
router.post('/', authenticateToken, requireRole('tenant'), MaintenanceController.createRequest);
router.put('/:id/status', authenticateToken, requireRole('landlord'), MaintenanceController.updateRequestStatus);

module.exports = router;
