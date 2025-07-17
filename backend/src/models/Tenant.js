const database = require('../utils/database');

class Tenant {
  static create(tenantData) {
    return new Promise((resolve, reject) => {
      const { userId, propertyId, leaseStartDate, leaseEndDate, monthlyRent, depositAmount } = tenantData;
      const db = database.getDb();
      
      db.run(
        'INSERT INTO tenants (user_id, property_id, lease_start_date, lease_end_date, monthly_rent, deposit_amount) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, propertyId, leaseStartDate, leaseEndDate, monthlyRent, depositAmount],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...tenantData });
          }
        }
      );
    });
  }

  static findByLandlord(landlordId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      const query = `
        SELECT t.*, u.first_name, u.last_name, u.email, p.address
        FROM tenants t
        JOIN users u ON t.user_id = u.id
        JOIN properties p ON t.property_id = p.id
        WHERE p.landlord_id = ?
      `;
      
      db.all(query, [landlordId], (err, tenants) => {
        if (err) {
          reject(err);
        } else {
          resolve(tenants);
        }
      });
    });
  }

  static findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.get('SELECT * FROM tenants WHERE user_id = ? AND status = "active"', [userId], (err, tenant) => {
        if (err) {
          reject(err);
        } else {
          resolve(tenant);
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.get('SELECT * FROM tenants WHERE id = ?', [id], (err, tenant) => {
        if (err) {
          reject(err);
        } else {
          resolve(tenant);
        }
      });
    });
  }

  static updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.run('UPDATE tenants SET status = ? WHERE id = ?', [status, id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, status });
        }
      });
    });
  }
}

module.exports = Tenant;
