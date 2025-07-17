const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, PaymentController.getPayments);
router.post('/', authenticateToken, requireRole('tenant'), PaymentController.createPayment);
router.put('/:id/confirm', authenticateToken, requireRole('landlord'), PaymentController.confirmPayment);
router.put('/:id/reject', authenticateToken, requireRole('landlord'), PaymentController.rejectPayment);

module.exports = router;
