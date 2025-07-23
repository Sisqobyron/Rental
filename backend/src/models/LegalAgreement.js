const database = require('../utils/database');

class LegalAgreement {
  static create(agreementData) {
    return new Promise((resolve, reject) => {
      const {
        tenantId,
        propertyId,
        agreementType = 'lease',
        rentDueDay = 1,
        lateFeeAmount = 0.00,
        lateFeeGraceDays = 5,
        securityDepositTerms,
        propertyDamagePolicy,
        maintenanceResponsibility,
        terminationNoticeDays = 30,
        petPolicy,
        smokingPolicy = 'No smoking allowed',
        guestPolicy,
        utilitiesIncluded,
        parkingDetails,
        additionalTerms
      } = agreementData;
      
      const db = database.getDb();
      
      db.run(
        `INSERT INTO legal_agreements (
          tenant_id, property_id, agreement_type, rent_due_day, late_fee_amount, 
          late_fee_grace_days, security_deposit_terms, property_damage_policy, 
          maintenance_responsibility, termination_notice_days, pet_policy, 
          smoking_policy, guest_policy, utilities_included, parking_details, 
          additional_terms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tenantId, propertyId, agreementType, rentDueDay, lateFeeAmount,
          lateFeeGraceDays, securityDepositTerms, propertyDamagePolicy,
          maintenanceResponsibility, terminationNoticeDays, petPolicy,
          smokingPolicy, guestPolicy, utilitiesIncluded, parkingDetails,
          additionalTerms
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...agreementData });
          }
        }
      );
    });
  }

  static findByTenantId(tenantId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.all(
        `SELECT la.*, p.address, p.city, u.first_name, u.last_name, u.email
         FROM legal_agreements la
         JOIN properties p ON la.property_id = p.id
         JOIN tenants t ON la.tenant_id = t.id
         JOIN users u ON t.user_id = u.id
         WHERE la.tenant_id = ?
         ORDER BY la.created_at DESC`,
        [tenantId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  static findByPropertyId(propertyId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.all(
        `SELECT la.*, u.first_name, u.last_name, u.email
         FROM legal_agreements la
         JOIN tenants t ON la.tenant_id = t.id
         JOIN users u ON t.user_id = u.id
         WHERE la.property_id = ?
         ORDER BY la.created_at DESC`,
        [propertyId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows);
          }
        }
      );
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.get(
        `SELECT la.*, p.address, p.city, p.rent_amount, u.first_name, u.last_name, u.email,
                ll.first_name as landlord_first_name, ll.last_name as landlord_last_name, ll.email as landlord_email
         FROM legal_agreements la
         JOIN properties p ON la.property_id = p.id
         JOIN tenants t ON la.tenant_id = t.id
         JOIN users u ON t.user_id = u.id
         JOIN users ll ON p.landlord_id = ll.id
         WHERE la.id = ?`,
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row);
          }
        }
      );
    });
  }

  static signAgreement(id, signatureType, userId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      let signatureField;
      if (signatureType === 'landlord') {
        signatureField = 'landlord_signature';
      } else if (signatureType === 'tenant') {
        signatureField = 'tenant_signature';
      } else {
        reject(new Error('Invalid signature type'));
        return;
      }
      
      db.run(
        `UPDATE legal_agreements SET ${signatureField} = 1, signed_date = CURRENT_TIMESTAMP WHERE id = ?`,
        [id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true });
          }
        }
      );
    });
  }

  static update(id, agreementData) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      const fields = [];
      const values = [];
      
      Object.keys(agreementData).forEach(key => {
        // Convert camelCase to snake_case for database
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbKey} = ?`);
        values.push(agreementData[key]);
      });
      
      values.push(id);
      
      db.run(
        `UPDATE legal_agreements SET ${fields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true });
          }
        }
      );
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.run(
        'DELETE FROM legal_agreements WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true });
          }
        }
      );
    });
  }
}

module.exports = LegalAgreement;
