const express = require('express');
const PropertyController = require('../controllers/propertyController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.get('/search', PropertyController.searchProperties);
router.get('/available', PropertyController.getAvailableProperties);

// Protected routes (authentication required)
router.get('/', authenticateToken, PropertyController.getProperties);
router.post('/', authenticateToken, requireRole('landlord'), PropertyController.createProperty);
router.get('/:id', authenticateToken, PropertyController.getProperty);
router.put('/:id', authenticateToken, requireRole('landlord'), PropertyController.updateProperty);
router.delete('/:id', authenticateToken, requireRole('landlord'), PropertyController.deleteProperty);

module.exports = router;
