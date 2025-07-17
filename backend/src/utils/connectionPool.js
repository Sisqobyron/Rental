const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class ConnectionPool {
  constructor(maxConnections = 10) {
    this.maxConnections = maxConnections;
    this.connections = [];
    this.activeConnections = 0;
    this.waitingQueue = [];
    this.dbPath = path.join(__dirname, '../../landlord_tenant.db');
  }

  async getConnection() {
    return new Promise((resolve, reject) => {
      // If we have available connections, return one
      if (this.connections.length > 0) {
        const connection = this.connections.pop();
        this.activeConnections++;
        resolve(connection);
        return;
      }

      // If we haven't reached max connections, create a new one
      if (this.activeConnections < this.maxConnections) {
        try {
          const connection = new sqlite3.Database(this.dbPath);
          this.activeConnections++;
          resolve(connection);
        } catch (error) {
          reject(error);
        }
        return;
      }

      // Otherwise, queue the request
      this.waitingQueue.push({ resolve, reject });
    });
  }

  releaseConnection(connection) {
    this.activeConnections--;

    // If there are waiting requests, fulfill the next one
    if (this.waitingQueue.length > 0) {
      const { resolve } = this.waitingQueue.shift();
      this.activeConnections++;
      resolve(connection);
      return;
    }

    // Otherwise, return connection to pool
    this.connections.push(connection);
  }

  async executeQuery(query, params = []) {
    const connection = await this.getConnection();
    
    return new Promise((resolve, reject) => {
      const isSelect = query.trim().toLowerCase().startsWith('select');
      
      if (isSelect) {
        connection.all(query, params, (err, rows) => {
          this.releaseConnection(connection);
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        connection.run(query, params, function(err) {
          this.releaseConnection(connection);
          if (err) reject(err);
          else resolve({ id: this.lastID, changes: this.changes });
        }.bind(this));
      }
    });
  }

  async close() {
    // Wait for all active connections to finish
    while (this.activeConnections > 0) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Close all pooled connections
    const closePromises = this.connections.map(conn => 
      new Promise(resolve => conn.close(resolve))
    );
    
    await Promise.all(closePromises);
    this.connections = [];
  }
}

// Create singleton instance
const connectionPool = new ConnectionPool(15);

module.exports = connectionPool;
