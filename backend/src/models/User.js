const database = require('../utils/database');

class User {
  static create(userData) {
    return new Promise((resolve, reject) => {
      const { email, password, role, firstName, lastName, phone } = userData;
      const db = database.getDb();
      
      db.run(
        'INSERT INTO users (email, password, role, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [email, password, role, firstName, lastName, phone],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...userData });
          }
        }
      );
    });
  }

  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

  static findById(id) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        if (err) {
          reject(err);
        } else {
          resolve(user);
        }
      });
    });
  }

  static findAll() {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.all('SELECT id, email, role, first_name, last_name, phone, created_at FROM users', (err, users) => {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
    });
  }

  static findByRole(role) {
    return new Promise((resolve, reject) => {
      const db = database.getDb();
      
      db.all('SELECT id, email, role, first_name, last_name, phone, created_at FROM users WHERE role = ?', [role], (err, users) => {
        if (err) {
          reject(err);
        } else {
          resolve(users);
        }
      });
    });
  }
}

module.exports = User;
