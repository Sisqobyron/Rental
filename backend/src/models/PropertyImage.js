const database = require('../utils/database');

class PropertyImage {
  static create(imageData) {
    return new Promise((resolve, reject) => {
      const { propertyId, imagePath, imageName, isPrimary } = imageData;
      const db = database.getDb();
      
      db.run(
        'INSERT INTO property_images (property_id, image_path, image_name, is_primary) VALUES (?, ?, ?, ?)',
        [propertyId, imagePath, imageName, isPrimary || 0],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...imageData });
          }
        }
      );
    });
  }

  static findByPropertyId(propertyId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.all(
        'SELECT * FROM property_images WHERE property_id = ? ORDER BY is_primary DESC, created_at ASC',
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

  static setPrimary(imageId, propertyId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.serialize(() => {
        // First, remove primary flag from all images of this property
        db.run(
          'UPDATE property_images SET is_primary = 0 WHERE property_id = ?',
          [propertyId],
          (err) => {
            if (err) {
              reject(err);
              return;
            }
            
            // Then set the specified image as primary
            db.run(
              'UPDATE property_images SET is_primary = 1 WHERE id = ?',
              [imageId],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve({ success: true });
                }
              }
            );
          }
        );
      });
    });
  }

  static delete(imageId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.run(
        'DELETE FROM property_images WHERE id = ?',
        [imageId],
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

  static deleteByPropertyId(propertyId) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.run(
        'DELETE FROM property_images WHERE property_id = ?',
        [propertyId],
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

module.exports = PropertyImage;
