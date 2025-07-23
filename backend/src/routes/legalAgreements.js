const express = require('express');
const LegalAgreementController = require('../controllers/legalAgreementController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Agreement management routes
router.get('/', LegalAgreementController.getAgreements);
router.post('/', LegalAgreementController.createAgreement);
router.get('/template', LegalAgreementController.getDefaultTemplate);
router.get('/:id', LegalAgreementController.getAgreementById);
router.put('/:id', LegalAgreementController.updateAgreement);
router.delete('/:id', LegalAgreementController.deleteAgreement);
router.post('/:id/sign', LegalAgreementController.signAgreement);

module.exports = router;
