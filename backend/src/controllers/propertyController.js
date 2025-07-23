const Property = require('../models/Property');
const PropertyImage = require('../models/PropertyImage');
const path = require('path');
const fs = require('fs');

class PropertyController {
  static async getProperties(req, res) {
    try {
      let properties;
      
      if (req.user.role === 'landlord') {
        properties = await Property.findByLandlordWithImages(req.user.id);
      } else {
        properties = await Property.findWithImages();
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
      
      // Handle image uploads if any
      if (req.files && req.files.length > 0) {
        for (let i = 0; i < req.files.length; i++) {
          const file = req.files[i];
          const imageData = {
            propertyId: property.id,
            imagePath: file.path,
            imageName: file.filename,
            isPrimary: i === 0 ? 1 : 0 // First image is primary
          };
          
          await PropertyImage.create(imageData);
        }
      }
      
      // Get the property with images for response
      const propertyWithImages = await Property.findByIdWithImages(property.id);
      
      res.status(201).json({
        message: 'Property added successfully',
        property: propertyWithImages
      });
    } catch (error) {
      console.error('Create property error:', error);
      
      // Clean up uploaded files if property creation fails
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      
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
      
      const properties = await Property.searchPropertiesWithImages(filters);
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

  // Image management methods
  static async uploadPropertyImages(req, res) {
    try {
      const { propertyId } = req.params;
      
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
      }
      
      const property = await Property.findById(propertyId);
      if (!property) {
        // Clean up uploaded files
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(404).json({ error: 'Property not found' });
      }
      
      // Check if user owns this property
      if (property.landlord_id !== req.user.id) {
        // Clean up uploaded files
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      const uploadedImages = [];
      for (const file of req.files) {
        const imageData = {
          propertyId: parseInt(propertyId),
          imagePath: file.path,
          imageName: file.filename,
          isPrimary: 0
        };
        
        const image = await PropertyImage.create(imageData);
        uploadedImages.push(image);
      }
      
      res.status(201).json({
        message: 'Images uploaded successfully',
        images: uploadedImages
      });
    } catch (error) {
      console.error('Upload images error:', error);
      
      // Clean up uploaded files on error
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async deletePropertyImage(req, res) {
    try {
      const { propertyId, imageId } = req.params;
      
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }
      
      // Check if user owns this property
      if (property.landlord_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      const images = await PropertyImage.findByPropertyId(propertyId);
      const imageToDelete = images.find(img => img.id == imageId);
      
      if (!imageToDelete) {
        return res.status(404).json({ error: 'Image not found' });
      }
      
      // Delete the physical file
      if (fs.existsSync(imageToDelete.image_path)) {
        fs.unlinkSync(imageToDelete.image_path);
      }
      
      // Delete from database
      await PropertyImage.delete(imageId);
      
      res.json({ message: 'Image deleted successfully' });
    } catch (error) {
      console.error('Delete image error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async setPrimaryImage(req, res) {
    try {
      const { propertyId, imageId } = req.params;
      
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json({ error: 'Property not found' });
      }
      
      // Check if user owns this property
      if (property.landlord_id !== req.user.id) {
        return res.status(403).json({ error: 'Unauthorized' });
      }
      
      await PropertyImage.setPrimary(imageId, propertyId);
      
      res.json({ message: 'Primary image set successfully' });
    } catch (error) {
      console.error('Set primary image error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }

  static async getPropertyImages(req, res) {
    try {
      const { propertyId } = req.params;
      
      const images = await PropertyImage.findByPropertyId(propertyId);
      
      res.json({
        message: 'Images retrieved successfully',
        images
      });
    } catch (error) {
      console.error('Get property images error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  }
}

module.exports = PropertyController;
