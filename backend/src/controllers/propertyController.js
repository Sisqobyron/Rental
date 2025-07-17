const Property = require('../models/Property');

class PropertyController {
  static async getProperties(req, res) {
    try {
      let properties;
      
      if (req.user.role === 'landlord') {
        properties = await Property.findByLandlord(req.user.id);
      } else {
        properties = await Property.findAll();
      }
      
      res.json(properties);
    } catch (error) {
      console.error('Get properties error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async createProperty(req, res) {
    try {
      const { address, city, description, rentAmount, bedrooms, bathrooms, squareFeet, isAvailable } = req.body;
      
      const propertyData = {
        landlordId: req.user.id,
        address,
        city,
        description,
        rentAmount,
        bedrooms,
        bathrooms,
        squareFeet,
        isAvailable
      };
      
      const property = await Property.create(propertyData);
      
      res.status(201).json({
        message: 'Property added successfully',
        property
      });
    } catch (error) {
      console.error('Create property error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async updateProperty(req, res) {
    try {
      const { id } = req.params;
      const { address, city, description, rentAmount, bedrooms, bathrooms, squareFeet, isAvailable } = req.body;
      
      // Check if property belongs to the landlord
      const existingProperty = await Property.findById(id);
      if (!existingProperty || existingProperty.landlord_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      const propertyData = {
        address,
        city,
        description,
        rentAmount,
        bedrooms,
        bathrooms,
        squareFeet,
        isAvailable
      };
      
      const property = await Property.update(id, propertyData);
      
      res.json({
        message: 'Property updated successfully',
        property
      });
    } catch (error) {
      console.error('Update property error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async deleteProperty(req, res) {
    try {
      const { id } = req.params;
      
      // Check if property belongs to the landlord
      const existingProperty = await Property.findById(id);
      if (!existingProperty || existingProperty.landlord_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      await Property.delete(id);
      
      res.json({ message: 'Property deleted successfully' });
    } catch (error) {
      console.error('Delete property error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async getProperty(req, res) {
    try {
      const { id } = req.params;
      const property = await Property.findById(id);
      
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }
      
      // Check access permissions
      if (req.user.role === 'landlord' && property.landlord_id !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      res.json(property);
    } catch (error) {
      console.error('Get property error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async searchProperties(req, res) {
    try {
      const filters = req.query;
      console.log('Search filters received:', filters);
      
      const properties = await Property.searchProperties(filters);
      console.log('Search results count:', properties.length);
      
      res.json({
        message: 'Properties retrieved successfully',
        data: properties
      });
    } catch (error) {
      console.error('Search properties error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async getAvailableProperties(req, res) {
    try {
      const properties = await Property.findAvailable();
      
      res.json({
        message: 'Available properties retrieved successfully',
        data: properties
      });
    } catch (error) {
      console.error('Get available properties error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = PropertyController;
