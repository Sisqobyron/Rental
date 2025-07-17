const RentPayment = require('../models/RentPayment');
const database = require('../utils/database');

class DashboardController {
  static async getStats(req, res) {
    try {
      const db = database.getDb();
      const stats = {};
      
      // Get total properties
      const totalProperties = await new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM properties WHERE landlord_id = ?', [req.user.id], (err, result) => {
          if (err) reject(err);
          else resolve(result.count);
        });
      });
      
      // Get total tenants
      const totalTenants = await new Promise((resolve, reject) => {
        db.get(`
          SELECT COUNT(*) as count 
          FROM tenants t 
          JOIN properties p ON t.property_id = p.id 
          WHERE p.landlord_id = ? AND t.status = 'active'
        `, [req.user.id], (err, result) => {
          if (err) reject(err);
          else resolve(result.count);
        });
      });
      
      // Get monthly revenue
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyRevenue = await new Promise((resolve, reject) => {
        db.get(`
          SELECT SUM(rp.amount) as revenue
          FROM rent_payments rp
          JOIN tenants t ON rp.tenant_id = t.id
          JOIN properties p ON t.property_id = p.id
          WHERE p.landlord_id = ? AND rp.status = 'confirmed' AND rp.payment_month = ?
        `, [req.user.id, currentMonth], (err, result) => {
          if (err) reject(err);
          else resolve(result.revenue || 0);
        });
      });
      
      // Get pending maintenance requests
      const pendingMaintenance = await new Promise((resolve, reject) => {
        db.get(`
          SELECT COUNT(*) as count
          FROM maintenance_requests mr
          JOIN properties p ON mr.property_id = p.id
          WHERE p.landlord_id = ? AND mr.status = 'pending'
        `, [req.user.id], (err, result) => {
          if (err) reject(err);
          else resolve(result.count);
        });
      });
      
      stats.totalProperties = totalProperties;
      stats.totalTenants = totalTenants;
      stats.monthlyRevenue = monthlyRevenue;
      stats.pendingMaintenance = pendingMaintenance;
      
      res.json(stats);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async getMonthlySummary(req, res) {
    try {
      const summary = await RentPayment.getMonthlySummary(req.user.id);
      res.json(summary);
    } catch (error) {
      console.error('Get monthly summary error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = DashboardController;
