const database = require('../utils/database');

class RentPayment {
  static create(paymentData) {
    return new Promise((resolve, reject) => {
      const { tenantId, amount, paymentDate, paymentMonth, paymentMethod } = paymentData;
      const db = database.getDb();
      
      db.run(
        'INSERT INTO rent_payments (tenant_id, amount, payment_date, payment_month, payment_method) VALUES (?, ?, ?, ?, ?)',
        [tenantId, amount, paymentDate, paymentMonth, paymentMethod],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...paymentData });
          }
        }
      );
    });
  }

  static findByLandlord(landlordId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      const query = `
        SELECT rp.*, t.id as tenant_id, u.first_name, u.last_name, p.address
        FROM rent_payments rp
        JOIN tenants t ON rp.tenant_id = t.id
        JOIN users u ON t.user_id = u.id
        JOIN properties p ON t.property_id = p.id
        WHERE p.landlord_id = ?
        ORDER BY rp.payment_date DESC
      `;
      
      db.all(query, [landlordId], (err, payments) => {
        if (err) {
          reject(err);
        } else {
          resolve(payments);
        }
      });
    });
  }

  static findByTenant(userId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      const query = `
        SELECT rp.*, p.address
        FROM rent_payments rp
        JOIN tenants t ON rp.tenant_id = t.id
        JOIN properties p ON t.property_id = p.id
        WHERE t.user_id = ?
        ORDER BY rp.payment_date DESC
      `;
      
      db.all(query, [userId], (err, payments) => {
        if (err) {
          reject(err);
        } else {
          resolve(payments);
        }
      });
    });
  }

  static updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.run('UPDATE rent_payments SET status = ? WHERE id = ?', [status, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, status });
        }
      });
    });
  }

  static getMonthlySummary(landlordId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      const query = `
        SELECT 
          rp.payment_month,
          SUM(rp.amount) as total_amount,
          COUNT(*) as payment_count
        FROM rent_payments rp
        JOIN tenants t ON rp.tenant_id = t.id
        JOIN properties p ON t.property_id = p.id
        WHERE p.landlord_id = ? AND rp.status = 'confirmed'
        GROUP BY rp.payment_month
        ORDER BY rp.payment_month DESC
        LIMIT 12
      `;
      
      db.all(query, [landlordId], (err, summary) => {
        if (err) {
          reject(err);
        } else {
          resolve(summary);
        }
      });
    });
  }
}

module.exports = RentPayment;
