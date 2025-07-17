const database = require('../utils/database');

class MaintenanceRequest {
  static create(requestData) {
    return new Promise((resolve, reject) => {
      const { tenantId, propertyId, title, description, priority } = requestData;
      const db = database.getDb();
      
      db.run(
        'INSERT INTO maintenance_requests (tenant_id, property_id, title, description, priority) VALUES (?, ?, ?, ?, ?)',
        [tenantId, propertyId, title, description, priority],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...requestData });
          }
        }
      );
    });
  }

  static findByLandlord(landlordId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      const query = `
        SELECT mr.*, u.first_name, u.last_name, p.address
        FROM maintenance_requests mr
        JOIN tenants t ON mr.tenant_id = t.id
        JOIN users u ON t.user_id = u.id
        JOIN properties p ON mr.property_id = p.id
        WHERE p.landlord_id = ?
        ORDER BY mr.created_at DESC
      `;
      
      db.all(query, [landlordId], (err, requests) => {
        if (err) {
          reject(err);
        } else {
          resolve(requests);
        }
      });
    });
  }

  static findByTenant(userId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      const query = `
        SELECT mr.*, p.address
        FROM maintenance_requests mr
        JOIN tenants t ON mr.tenant_id = t.id
        JOIN properties p ON mr.property_id = p.id
        WHERE t.user_id = ?
        ORDER BY mr.created_at DESC
      `;
      
      db.all(query, [userId], (err, requests) => {
        if (err) {
          reject(err);
        } else {
          resolve(requests);
        }
      });
    });
  }

  static updateStatus(id, status) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      const completedAt = status === 'completed' ? new Date().toISOString() : null;
      
      db.run(
        'UPDATE maintenance_requests SET status = ?, completed_at = ? WHERE id = ?',
        [status, completedAt, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, status, completedAt });
          }
        }
      );
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.get('SELECT * FROM maintenance_requests WHERE id = ?', [id], (err, request) => {
        if (err) {
          reject(err);
        } else {
          resolve(request);
        }
      });
    });
  }
}

module.exports = MaintenanceRequest;
