const express = require('express');
const TenantController = require('../controllers/tenantController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, requireRole('landlord'), TenantController.getTenants);
router.post('/', authenticateToken, requireRole('landlord'), TenantController.createTenant);
router.put('/:id/status', authenticateToken, requireRole('landlord'), TenantController.updateTenantStatus);
router.get('/users', authenticateToken, requireRole('landlord'), TenantController.getTenantUsers);

module.exports = router;
