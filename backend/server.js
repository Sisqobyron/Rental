const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('landlord_tenant.db');

// Initialize database tables
db.serialize(() => {
  // Users table (landlords and tenants)
  db.run(`CREATE TABLE IF NOT EXISTS users (
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
  db.run(`CREATE TABLE IF NOT EXISTS properties (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    landlord_id INTEGER NOT NULL,
    address TEXT NOT NULL,
    description TEXT,
    rent_amount DECIMAL(10,2) NOT NULL,
    bedrooms INTEGER,
    bathrooms INTEGER,
    square_feet INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (landlord_id) REFERENCES users(id)
  )`);

  // Tenants table (rental agreements)
  db.run(`CREATE TABLE IF NOT EXISTS tenants (
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
  db.run(`CREATE TABLE IF NOT EXISTS rent_payments (
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
  db.run(`CREATE TABLE IF NOT EXISTS maintenance_requests (
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
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role, firstName, lastName, phone } = req.body;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    db.run(
      'INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, role, firstName, lastName, phone],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'Email already exists' });
        }
        
        const token = jwt.sign(
          { id: this.lastID, email, role },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: { id: this.lastID, email, role, firstName, lastName }
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name
      }
    });
  });
});

// Properties routes
app.get('/api/properties', authenticateToken, (req, res) => {
  let query = 'SELECT * FROM properties';
  let params = [];
  
  if (req.user.role === 'landlord') {
    query += ' WHERE landlord_id = ?';
    params = [req.user.id];
  }
  
  db.all(query, params, (err, properties) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(properties);
  });
});

app.post('/api/properties', authenticateToken, (req, res) => {
  if (req.user.role !== 'landlord') {
    return res.status(403).json({ error: 'Only landlords can add properties' });
  }
  
  const { address, description, rentAmount, bedrooms, bathrooms, squareFeet } = req.body;
  
  db.run(
    'INSERT INTO properties (landlord_id, address, description, rent_amount, bedrooms, bathrooms, square_feet) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [req.user.id, address, description, rentAmount, bedrooms, bathrooms, squareFeet],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ 
        message: 'Property added successfully',
        propertyId: this.lastID
      });
    }
  );
});

// Tenants routes
app.get('/api/tenants', authenticateToken, (req, res) => {
  if (req.user.role !== 'landlord') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const query = `
    SELECT t.*, u.first_name, u.last_name, u.email, p.address
    FROM tenants t
    JOIN users u ON t.user_id = u.id
    JOIN properties p ON t.property_id = p.id
    WHERE p.landlord_id = ?
  `;
  
  db.all(query, [req.user.id], (err, tenants) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(tenants);
  });
});

app.post('/api/tenants', authenticateToken, (req, res) => {
  if (req.user.role !== 'landlord') {
    return res.status(403).json({ error: 'Only landlords can add tenants' });
  }
  
  const { userId, propertyId, leaseStartDate, leaseEndDate, monthlyRent, depositAmount } = req.body;
  
  db.run(
    'INSERT INTO tenants (user_id, property_id, lease_start_date, lease_end_date, monthly_rent, deposit_amount) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, propertyId, leaseStartDate, leaseEndDate, monthlyRent, depositAmount],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ 
        message: 'Tenant added successfully',
        tenantId: this.lastID
      });
    }
  );
});

// Rent payments routes
app.get('/api/rent-payments', authenticateToken, (req, res) => {
  let query, params;
  
  if (req.user.role === 'landlord') {
    query = `
      SELECT rp.*, t.id as tenant_id, u.first_name, u.last_name, p.address
      FROM rent_payments rp
      JOIN tenants t ON rp.tenant_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN properties p ON t.property_id = p.id
      WHERE p.landlord_id = ?
      ORDER BY rp.payment_date DESC
    `;
    params = [req.user.id];
  } else {
    query = `
      SELECT rp.*, p.address
      FROM rent_payments rp
      JOIN tenants t ON rp.tenant_id = t.id
      JOIN properties p ON t.property_id = p.id
      WHERE t.user_id = ?
      ORDER BY rp.payment_date DESC
    `;
    params = [req.user.id];
  }
  
  db.all(query, params, (err, payments) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(payments);
  });
});

app.post('/api/rent-payments', authenticateToken, (req, res) => {
  const { amount, paymentDate, paymentMonth, paymentMethod } = req.body;
  
  // Get tenant record for current user
  db.get('SELECT id FROM tenants WHERE user_id = ? AND status = "active"', [req.user.id], (err, tenant) => {
    if (err || !tenant) {
      return res.status(404).json({ error: 'No active rental found' });
    }
    
    db.run(
      'INSERT INTO rent_payments (tenant_id, amount, payment_date, payment_month, payment_method) VALUES (?, ?, ?, ?, ?)',
      [tenant.id, amount, paymentDate, paymentMonth, paymentMethod],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ 
          message: 'Payment submitted successfully',
          paymentId: this.lastID
        });
      }
    );
  });
});

app.put('/api/rent-payments/:id/confirm', authenticateToken, (req, res) => {
  if (req.user.role !== 'landlord') {
    return res.status(403).json({ error: 'Only landlords can confirm payments' });
  }
  
  db.run(
    'UPDATE rent_payments SET status = "confirmed" WHERE id = ?',
    [req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Payment confirmed successfully' });
    }
  );
});

// Maintenance requests routes
app.get('/api/maintenance-requests', authenticateToken, (req, res) => {
  let query, params;
  
  if (req.user.role === 'landlord') {
    query = `
      SELECT mr.*, u.first_name, u.last_name, p.address
      FROM maintenance_requests mr
      JOIN tenants t ON mr.tenant_id = t.id
      JOIN users u ON t.user_id = u.id
      JOIN properties p ON mr.property_id = p.id
      WHERE p.landlord_id = ?
      ORDER BY mr.created_at DESC
    `;
    params = [req.user.id];
  } else {
    query = `
      SELECT mr.*, p.address
      FROM maintenance_requests mr
      JOIN tenants t ON mr.tenant_id = t.id
      JOIN properties p ON mr.property_id = p.id
      WHERE t.user_id = ?
      ORDER BY mr.created_at DESC
    `;
    params = [req.user.id];
  }
  
  db.all(query, params, (err, requests) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(requests);
  });
});

app.post('/api/maintenance-requests', authenticateToken, (req, res) => {
  const { title, description, priority } = req.body;
  
  // Get tenant record for current user
  db.get('SELECT id, property_id FROM tenants WHERE user_id = ? AND status = "active"', [req.user.id], (err, tenant) => {
    if (err || !tenant) {
      return res.status(404).json({ error: 'No active rental found' });
    }
    
    db.run(
      'INSERT INTO maintenance_requests (tenant_id, property_id, title, description, priority) VALUES (?, ?, ?, ?, ?)',
      [tenant.id, tenant.property_id, title, description, priority],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ 
          message: 'Maintenance request submitted successfully',
          requestId: this.lastID
        });
      }
    );
  });
});

app.put('/api/maintenance-requests/:id/status', authenticateToken, (req, res) => {
  if (req.user.role !== 'landlord') {
    return res.status(403).json({ error: 'Only landlords can update request status' });
  }
  
  const { status } = req.body;
  const completedAt = status === 'completed' ? new Date().toISOString() : null;
  
  db.run(
    'UPDATE maintenance_requests SET status = ?, completed_at = ? WHERE id = ?',
    [status, completedAt, req.params.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Request status updated successfully' });
    }
  );
});

// Dashboard stats routes
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  if (req.user.role !== 'landlord') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const stats = {};
  
  // Get total properties
  db.get('SELECT COUNT(*) as count FROM properties WHERE landlord_id = ?', [req.user.id], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    stats.totalProperties = result.count;
    
    // Get total tenants
    db.get(`
      SELECT COUNT(*) as count 
      FROM tenants t 
      JOIN properties p ON t.property_id = p.id 
      WHERE p.landlord_id = ? AND t.status = 'active'
    `, [req.user.id], (err, result) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      stats.totalTenants = result.count;
      
      // Get monthly revenue
      db.get(`
        SELECT SUM(rp.amount) as revenue
        FROM rent_payments rp
        JOIN tenants t ON rp.tenant_id = t.id
        JOIN properties p ON t.property_id = p.id
        WHERE p.landlord_id = ? AND rp.status = 'confirmed' AND rp.payment_month = ?
      `, [req.user.id, new Date().toISOString().slice(0, 7)], (err, result) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        stats.monthlyRevenue = result.revenue || 0;
        
        // Get pending maintenance requests
        db.get(`
          SELECT COUNT(*) as count
          FROM maintenance_requests mr
          JOIN properties p ON mr.property_id = p.id
          WHERE p.landlord_id = ? AND mr.status = 'pending'
        `, [req.user.id], (err, result) => {
          if (err) return res.status(500).json({ error: 'Database error' });
          stats.pendingMaintenance = result.count;
          
          res.json(stats);
        });
      });
    });
  });
});

// Monthly rent summary for charts
app.get('/api/dashboard/monthly-summary', authenticateToken, (req, res) => {
  if (req.user.role !== 'landlord') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
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
  
  db.all(query, [req.user.id], (err, summary) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(summary);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
