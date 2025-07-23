const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class Database {
  constructor() {
    this.db = new sqlite3.Database(path.join(__dirname, '../../landlord_tenant.db'));
    this.initializeTables();
  }

  initializeTables() {
    this.db.serialize(() => {
      // Users table (landlords and tenants)
      this.db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('landlord', 'tenant')),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);

      // Properties table
      this.db.run(`CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        landlord_id INTEGER NOT NULL,
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        description TEXT,
        rent_amount DECIMAL(10,2) NOT NULL,
        bedrooms INTEGER,
        bathrooms INTEGER,
        square_feet INTEGER,
        is_available BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (landlord_id) REFERENCES users(id)
      )`);

      // Tenants table (rental agreements)
      this.db.run(`CREATE TABLE IF NOT EXISTS tenants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        property_id INTEGER NOT NULL,
        lease_start_date DATE NOT NULL,
        lease_end_date DATE NOT NULL,
        monthly_rent DECIMAL(10,2) NOT NULL,
        deposit_amount DECIMAL(10,2),
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (property_id) REFERENCES properties(id)
      )`);

      // Rent payments table
      this.db.run(`CREATE TABLE IF NOT EXISTS rent_payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_date DATE NOT NULL,
        payment_month TEXT NOT NULL,
        payment_method TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'rejected')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id)
      )`);

      // Maintenance requests table
      this.db.run(`CREATE TABLE IF NOT EXISTS maintenance_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        property_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'cancelled')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id),
        FOREIGN KEY (property_id) REFERENCES properties(id)
      )`);

      // Messages table
      this.db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        property_id INTEGER,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id),
        FOREIGN KEY (receiver_id) REFERENCES users(id),
        FOREIGN KEY (property_id) REFERENCES properties(id)
      )`);

      // Property images table
      this.db.run(`CREATE TABLE IF NOT EXISTS property_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        property_id INTEGER NOT NULL,
        image_path TEXT NOT NULL,
        image_name TEXT NOT NULL,
        is_primary BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )`);

      // Legal agreements table
      this.db.run(`CREATE TABLE IF NOT EXISTS legal_agreements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tenant_id INTEGER NOT NULL,
        property_id INTEGER NOT NULL,
        agreement_type TEXT DEFAULT 'lease' CHECK(agreement_type IN ('lease', 'amendment', 'termination')),
        rent_due_day INTEGER DEFAULT 1,
        late_fee_amount DECIMAL(10,2) DEFAULT 0.00,
        late_fee_grace_days INTEGER DEFAULT 5,
        security_deposit_terms TEXT,
        property_damage_policy TEXT,
        maintenance_responsibility TEXT,
        termination_notice_days INTEGER DEFAULT 30,
        pet_policy TEXT,
        smoking_policy TEXT DEFAULT 'No smoking allowed',
        guest_policy TEXT,
        utilities_included TEXT,
        parking_details TEXT,
        additional_terms TEXT,
        landlord_signature BOOLEAN DEFAULT 0,
        tenant_signature BOOLEAN DEFAULT 0,
        signed_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
      )`);
    });
  }

  getDb() {
    return this.db;
  }

  close() {
    this.db.close();
  }
}

module.exports = new Database();
