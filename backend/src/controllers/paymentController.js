const RentPayment = require('../models/RentPayment');
const Tenant = require('../models/Tenant');

class PaymentController {
  static async getPayments(req, res) {
    try {
      let payments;
      
      if (req.user.role === 'landlord') {
        payments = await RentPayment.findByLandlord(req.user.id);
      } else {
        payments = await RentPayment.findByTenant(req.user.id);
      }
      
      res.json(payments);
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async createPayment(req, res) {
    try {
      const { amount, paymentDate, paymentMonth, paymentMethod } = req.body;
      
      // Get tenant record for current user
      const tenant = await Tenant.findByUserId(req.user.id);
      if (!tenant) {
        return res.status(404).json({ error: 'No active rental found' });
      }
      
      const paymentData = {
        tenantId: tenant.id,
        amount,
        paymentDate,
        paymentMonth,
        paymentMethod
      };
      
      const payment = await RentPayment.create(paymentData);
      
      res.status(201).json({
        message: 'Payment submitted successfully',
        payment
      });
    } catch (error) {
      console.error('Create payment error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async confirmPayment(req, res) {
    try {
      const { id } = req.params;
      
      const payment = await RentPayment.updateStatus(id, 'confirmed');
      
      res.json({
        message: 'Payment confirmed successfully',
        payment
      });
    } catch (error) {
      console.error('Confirm payment error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async rejectPayment(req, res) {
    try {
      const { id } = req.params;
      
      const payment = await RentPayment.updateStatus(id, 'rejected');
      
      res.json({
        message: 'Payment rejected',
        payment
      });
    } catch (error) {
      console.error('Reject payment error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = PaymentController;
