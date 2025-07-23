const database = require('../utils/database');
const connectionPool = require('../utils/connectionPool');
const PropertyImage = require('./PropertyImage');

// In-memory cache with TTL
class PropertyCache {
  constructor(ttl = 300000) { // 5 minutes default TTL
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }
}

const propertyCache = new PropertyCache();

class Property {
  static create(propertyData) {
    return new Promise((resolve, reject) => {
      const { landlordId, address, city, description, rentAmount, bedrooms, bathrooms, squareFeet, isAvailable } = propertyData;
      const db = database.getDb();
      
      db.run(
        'INSERT INTO properties (landlord_id, address, city, description, rent_amount, bedrooms, bathrooms, square_feet, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [landlordId, address, city, description, rentAmount, bedrooms, bathrooms, squareFeet, isAvailable !== undefined ? isAvailable : 1],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...propertyData });
          }
        }
      );
    });
  }

  static findByLandlord(landlordId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.all('SELECT * FROM properties WHERE landlord_id = ?', [landlordId], (err, properties) => {
        if (err) {
          reject(err);
        } else {
          resolve(properties);
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.get('SELECT * FROM properties WHERE id = ?', [id], (err, property) => {
        if (err) {
          reject(err);
        } else {
          resolve(property);
        }
      });
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.all('SELECT * FROM properties', (err, properties) => {
        if (err) {
          reject(err);
        } else {
          resolve(properties);
        }
      });
    });
  }

  static update(id, propertyData) {
    return new Promise((resolve, reject) => {
      const { address, city, description, rentAmount, bedrooms, bathrooms, squareFeet, isAvailable } = propertyData;
      const db = database.getDb();
      
      db.run(
        'UPDATE properties SET address = ?, city = ?, description = ?, rent_amount = ?, bedrooms = ?, bathrooms = ?, square_feet = ?, is_available = ? WHERE id = ?',
        [address, city, description, rentAmount, bedrooms, bathrooms, squareFeet, isAvailable, id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id, ...propertyData });
          }
        }
      );
    });
  }

  static searchProperties(filters = {}) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      let query = `
        SELECT p.*, u.first_name as landlord_first_name, u.last_name as landlord_last_name, u.email as landlord_email
        FROM properties p
        JOIN users u ON p.landlord_id = u.id
        WHERE p.is_available = 1
      `;
      const params = [];

      // Add filters
      if (filters.city) {
        query += ' AND LOWER(p.city) LIKE LOWER(?)';
        params.push(`%${filters.city}%`);
      }

      if (filters.minPrice) {
        query += ' AND p.rent_amount >= ?';
        params.push(filters.minPrice);
      }

      if (filters.maxPrice) {
        query += ' AND p.rent_amount <= ?';
        params.push(filters.maxPrice);
      }

      if (filters.bedrooms) {
        query += ' AND p.bedrooms >= ?';
        params.push(filters.bedrooms);
      }

      if (filters.bathrooms) {
        query += ' AND p.bathrooms >= ?';
        params.push(filters.bathrooms);
      }

      if (filters.search) {
        query += ' AND (LOWER(p.address) LIKE LOWER(?) OR LOWER(p.description) LIKE LOWER(?) OR LOWER(p.city) LIKE LOWER(?))';
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += ' ORDER BY p.created_at DESC';

      console.log('Generated SQL query:', query);
      console.log('Query parameters:', params);

      db.all(query, params, (err, properties) => {
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          console.log('Database returned', properties.length, 'properties');
          resolve(properties);
        }
      });
    });
  }

  static findAvailable() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.all(`
        SELECT p.*, u.first_name as landlord_first_name, u.last_name as landlord_last_name, u.email as landlord_email
        FROM properties p
        JOIN users u ON p.landlord_id = u.id
        WHERE p.is_available = 1
        ORDER BY p.created_at DESC
      `, (err, properties) => {
        if (err) {
          reject(err);
        } else {
          resolve(properties);
        }
      });
    });
  }

  static delete(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.run('DELETE FROM properties WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id, deleted: true });
        }
      });
    });
  }

  // Image-related methods
  static async findWithImages() {
    try {
      const properties = await this.findAll();
      
      for (let property of properties) {
        property.images = await PropertyImage.findByPropertyId(property.id);
      }
      
      return properties;
    } catch (error) {
      throw error;
    }
  }

  static async findByIdWithImages(id) {
    try {
      const property = await this.findById(id);
      if (property) {
        property.images = await PropertyImage.findByPropertyId(id);
      }
      return property;
    } catch (error) {
      throw error;
    }
  }

  static async findByLandlordWithImages(landlordId) {
    try {
      const properties = await this.findByLandlord(landlordId);
      
      for (let property of properties) {
        property.images = await PropertyImage.findByPropertyId(property.id);
      }
      
      return properties;
    } catch (error) {
      throw error;
    }
  }

  static async searchPropertiesWithImages(filters = {}) {
    try {
      const properties = await this.searchProperties(filters);
      
      for (let property of properties) {
        property.images = await PropertyImage.findByPropertyId(property.id);
      }
      
      return properties;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Property;
