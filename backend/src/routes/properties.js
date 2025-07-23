const express = require('express');
const PropertyController = require('../controllers/propertyController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { uploadPropertyImages } = require('../utils/upload');

const router = express.Router();

// Public routes (no authentication required)
router.get('/search', PropertyController.searchProperties);
router.get('/available', PropertyController.getAvailableProperties);

// Protected routes (authentication required)
router.get('/', authenticateToken, PropertyController.getProperties);
router.post('/', authenticateToken, requireRole('landlord'), uploadPropertyImages, PropertyController.createProperty);
router.get('/:id', authenticateToken, PropertyController.getProperty);
router.put('/:id', authenticateToken, requireRole('landlord'), PropertyController.updateProperty);
router.delete('/:id', authenticateToken, requireRole('landlord'), PropertyController.deleteProperty);

// Image management routes
router.get('/:propertyId/images', authenticateToken, PropertyController.getPropertyImages);
router.post('/:propertyId/images', authenticateToken, requireRole('landlord'), uploadPropertyImages, PropertyController.uploadPropertyImages);
router.delete('/:propertyId/images/:imageId', authenticateToken, requireRole('landlord'), PropertyController.deletePropertyImage);
router.put('/:propertyId/images/:imageId/primary', authenticateToken, requireRole('landlord'), PropertyController.setPrimaryImage);

module.exports = router;
