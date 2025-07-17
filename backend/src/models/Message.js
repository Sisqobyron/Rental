const db = require('../utils/database');

class Message {
  static async create(messageData) {
    return new Promise((resolve, reject) => {
      const { sender_id, receiver_id, property_id, subject, message } = messageData;
      
      const query = `
        INSERT INTO messages (sender_id, receiver_id, property_id, subject, message)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.getDb().run(query, [sender_id, receiver_id, property_id, subject, message], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...messageData });
        }
      });
    });
  }

  static async findByUserId(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT m.*, 
               s.first_name as sender_first_name, 
               s.last_name as sender_last_name,
               r.first_name as receiver_first_name,
               r.last_name as receiver_last_name,
               p.address as property_address
        FROM messages m
        LEFT JOIN users s ON m.sender_id = s.id
        LEFT JOIN users r ON m.receiver_id = r.id
        LEFT JOIN properties p ON m.property_id = p.id
        WHERE m.sender_id = ? OR m.receiver_id = ?
        ORDER BY m.created_at DESC
      `;
      
      db.getDb().all(query, [userId, userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async markAsRead(messageId, userId) {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE messages 
        SET is_read = 1 
        WHERE id = ? AND receiver_id = ?
      `;
      
      db.getDb().run(query, [messageId, userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  static async getUnreadCount(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT COUNT(*) as count 
        FROM messages 
        WHERE receiver_id = ? AND is_read = 0
      `;
      
      db.getDb().get(query, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row.count);
        }
      });
    });
  }

  static async getConversations(userId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT DISTINCT 
          CASE 
            WHEN m.sender_id = ? THEN m.receiver_id 
            ELSE m.sender_id 
          END as other_user_id,
          u.first_name,
          u.last_name,
          u.role,
          MAX(m.created_at) as last_message_date,
          COUNT(CASE WHEN m.receiver_id = ? AND m.is_read = 0 THEN 1 END) as unread_count
        FROM messages m
        JOIN users u ON (
          CASE 
            WHEN m.sender_id = ? THEN m.receiver_id = u.id
            ELSE m.sender_id = u.id
          END
        )
        WHERE m.sender_id = ? OR m.receiver_id = ?
        GROUP BY other_user_id
        ORDER BY last_message_date DESC
      `;
      
      db.getDb().all(query, [userId, userId, userId, userId, userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  static async getConversationMessages(userId, otherUserId) {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT m.*, 
               s.first_name as sender_first_name, 
               s.last_name as sender_last_name,
               p.address as property_address
        FROM messages m
        LEFT JOIN users s ON m.sender_id = s.id
        LEFT JOIN properties p ON m.property_id = p.id
        WHERE (m.sender_id = ? AND m.receiver_id = ?) 
           OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.created_at ASC
      `;
      
      db.getDb().all(query, [userId, otherUserId, otherUserId, userId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

module.exports = Message;
