const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function initDatabase() {
  console.log('🚀 Starting CWMS Database Initialization...');

  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    multipleStatements: true
  };

  let connection;
  try {
    console.log(`📡 Connecting to MySQL server at ${dbConfig.host}:${dbConfig.port} as user '${dbConfig.user}'...`);
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL server.');

    // 1. Read schema.sql
    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`schema.sql not found at ${schemaPath}`);
    }
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('📜 Executing schema.sql...');
    await connection.query(schemaSql);
    console.log('✅ Database schema and 9 tables created/verified successfully.');

    // 2. Read seed.sql
    const seedPath = path.join(__dirname, '..', '..', 'database', 'seed.sql');
    if (fs.existsSync(seedPath)) {
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      console.log('🌱 Executing seed.sql...');
      await connection.query(seedSql);
      console.log('✅ Seed data (Categories, Locations, Admin user) populated successfully.');
    }

    console.log('🎉 CWMS Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDatabase();
