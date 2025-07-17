const Tenant = require('../models/Tenant');
const User = require('../models/User');
const database = require('../utils/database');

class TenantController {
  static async getTenants(req, res) {
    try {
      const tenants = await Tenant.findByLandlord(req.user.id);
      res.json(tenants);
    } catch (error) {
      console.error('Get tenants error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async createTenant(req, res) {
    try {
      console.log('=== CREATE TENANT REQUEST ===');
      console.log('Request body:', req.body);
      console.log('User:', req.user);
      console.log('User role:', req.user?.role);
      
      const { 
        name, 
        email, 
        phone, 
        propertyAddress, 
        rentAmount, 
        leaseStart, 
        leaseEnd,
        // Legacy support for direct API calls
        userId, 
        propertyId, 
        leaseStartDate, 
        leaseEndDate, 
        monthlyRent, 
        depositAmount 
      } = req.body;

      console.log('Extracted fields:', {
        name, email, phone, propertyAddress, rentAmount, leaseStart, leaseEnd,
        userId, propertyId, leaseStartDate, leaseEndDate, monthlyRent, depositAmount
      });

      let finalUserId = userId;
      let finalPropertyId = propertyId;
      let finalMonthlyRent = monthlyRent || rentAmount;
      let finalLeaseStart = leaseStartDate || leaseStart;
      let finalLeaseEnd = leaseEndDate || leaseEnd;
      let finalDepositAmount = depositAmount || (finalMonthlyRent * 2); // Default to 2x monthly rent

      // If we have user details (name, email), create/find the user first
      if (email && !userId) {
        try {
          // First try to find existing user by email
          const existingUser = await User.findByEmail(email);
          if (existingUser) {
            finalUserId = existingUser.id;
          } else {
            // Create new user with role 'tenant'
            const [firstName, ...lastNameParts] = (name || '').split(' ');
            const lastName = lastNameParts.join(' ') || '';
            
            const userData = {
              email,
              password: 'defaultPassword123', // Should be changed by user
              role: 'tenant',
              firstName: firstName || 'Tenant',
              lastName: lastName || '',
              phone: phone || ''
            };
            
            const newUser = await User.create(userData);
            finalUserId = newUser.id;
          }
        } catch (userError) {
          console.error('Error creating/finding user:', userError);
          return res.status(400).json({ error: 'Failed to create tenant user' });
        }
      }

      // If we have propertyAddress but no propertyId, try to find the property
      if (propertyAddress && !propertyId) {
        try {
          const db = database.getDb();
          const property = await new Promise((resolve, reject) => {
            db.get(
              'SELECT id FROM properties WHERE address LIKE ? AND landlord_id = ?',
              [`%${propertyAddress}%`, req.user.id],
              (err, row) => {
                if (err) reject(err);
                else resolve(row);
              }
            );
          });
          
          if (property) {
            finalPropertyId = property.id;
          } else {
            return res.status(400).json({ 
              error: 'Property not found. Please ensure the property address is correct and belongs to you.' 
            });
          }
        } catch (propertyError) {
          console.error('Error finding property:', propertyError);
          return res.status(400).json({ error: 'Failed to find property' });
        }
      }

      // Validate required fields
      console.log('Final values before validation:', {
        finalUserId, finalPropertyId, finalMonthlyRent, finalLeaseStart, finalLeaseEnd, finalDepositAmount
      });
      
      if (!finalUserId || !finalPropertyId || !finalMonthlyRent) {
        console.log('Validation failed - missing required fields');
        return res.status(400).json({ 
          error: 'Missing required fields: user, property, and rent amount are required',
          debug: { finalUserId, finalPropertyId, finalMonthlyRent }
        });
      }

      const tenantData = {
        userId: finalUserId,
        propertyId: finalPropertyId,
        leaseStartDate: finalLeaseStart,
        leaseEndDate: finalLeaseEnd,
        monthlyRent: parseInt(finalMonthlyRent),
        depositAmount: parseInt(finalDepositAmount)
      };
      
      const tenant = await Tenant.create(tenantData);
      
      res.status(201).json({
        message: 'Tenant added successfully',
        tenant
      });
    } catch (error) {
      console.error('=== CREATE TENANT ERROR ===');
      console.error('Error details:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check if it's an authentication/authorization error
      if (error.message && error.message.includes('token')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      res.status(500).json({ 
        error: 'Database error',
        details: error.message 
      });
    }
  }

  static async updateTenantStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const tenant = await Tenant.updateStatus(id, status);
      
      res.json({
        message: 'Tenant status updated successfully',
        tenant
      });
    } catch (error) {
      console.error('Update tenant status error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async getTenantUsers(req, res) {
    try {
      const users = await User.findAll();
      const tenantUsers = users.filter(user => user.role === 'tenant');
      res.json(tenantUsers);
    } catch (error) {
      console.error('Get tenant users error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = TenantController;
