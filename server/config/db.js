const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const embeddedDb = require('./embeddedDb');

const path = require('path');

dotenv.config();
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Create connection pool (supports both cloud URI and individual env variables)
const dbConfig = process.env.DATABASE_URL || process.env.MYSQL_URL || {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_waste_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

let mysqlPool = null;
let useEmbedded = false;

try {
  mysqlPool = mysql.createPool(dbConfig);
} catch (error) {
  console.warn('⚠️ Could not initialize MySQL pool:', error.message);
  useEmbedded = true;
}

// Self-test database connection on startup
const testConnection = async () => {
  if (useEmbedded) return;
  try {
    const connection = await mysqlPool.getConnection();
    console.log('✅ Connected to MySQL database successfully.');
    connection.release();
  } catch (error) {
    console.warn(`⚠️ MySQL connection unavailable (${error.code || error.message}).`);
    console.log('🚀 Running in Zero-Crash Embedded Database mode (in-memory MySQL engine with campus seed data).');
    useEmbedded = true;
  }
};

testConnection();

// Dual-Engine Proxy Pool: routes queries to active MySQL or resilient embedded memory engine
const proxyPool = {
  async query(sql, params) {
    if (!useEmbedded && mysqlPool) {
      try {
        return await mysqlPool.query(sql, params);
      } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ER_BAD_DB_ERROR') {
          useEmbedded = true;
          console.warn('⚠️ Switching dynamically to Embedded Database mode due to connection error.');
          return await embeddedDb.query(sql, params);
        }
        throw err;
      }
    }
    return await embeddedDb.query(sql, params);
  },

  async getConnection() {
    if (!useEmbedded && mysqlPool) {
      try {
        return await mysqlPool.getConnection();
      } catch (err) {
        if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ER_BAD_DB_ERROR') {
          useEmbedded = true;
          console.warn('⚠️ Switching dynamically to Embedded Database mode for transaction.');
          return await embeddedDb.getConnection();
        }
        throw err;
      }
    }
    return await embeddedDb.getConnection();
  },

  isEmbedded() {
    return useEmbedded || !mysqlPool;
  },

  getEmbeddedDb() {
    return embeddedDb;
  }
};

module.exports = proxyPool;

