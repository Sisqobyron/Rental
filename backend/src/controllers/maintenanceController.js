const MaintenanceRequest = require('../models/MaintenanceRequest');
const Tenant = require('../models/Tenant');

class MaintenanceController {
  static async getRequests(req, res) {
    try {
      let requests;
      
      if (req.user.role === 'landlord') {
        requests = await MaintenanceRequest.findByLandlord(req.user.id);
      } else {
        requests = await MaintenanceRequest.findByTenant(req.user.id);
      }
      
      res.json(requests);
    } catch (error) {
      console.error('Get maintenance requests error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async createRequest(req, res) {
    try {
      const { issue, description, priority, title, tenantName, propertyId, category } = req.body;
      
      // Get tenant record for current user
      const tenant = await Tenant.findActiveByUserId(req.user.id);
      if (!tenant) {
        return res.status(404).json({ error: 'No active rental found' });
      }
      
      // Use the issue field as title (frontend sends 'issue', database expects 'title')
      const requestTitle = issue || title || 'Maintenance Request';
      
      const requestData = {
        tenantId: tenant.id,
        propertyId: tenant.property_id, // Use the property from tenant record
        title: requestTitle,
        description: description || '',
        priority: priority || 'medium'
      };
      
      const request = await MaintenanceRequest.create(requestData);
      
      res.status(201).json({
        message: 'Maintenance request submitted successfully',
        request
      });
    } catch (error) {
      console.error('Create maintenance request error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async updateRequestStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      const request = await MaintenanceRequest.updateStatus(id, status);
      
      res.json({
        message: 'Request status updated successfully',
        request
      });
    } catch (error) {
      console.error('Update maintenance request error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = MaintenanceController;
