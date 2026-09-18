const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 5000;
const BASE_URL = `http://localhost:${PORT}`;

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

async function resetDemoData() {
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('================================================================');
  console.log('  CAMPUS WASTE MONITORING SYSTEM (CWMS) - DEMO DATA RESET       ');
  console.log('================================================================');
  console.log(`${colors.reset}`);

  try {
    const res = await fetch(`${BASE_URL}/api/demo/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`${colors.green}✔ ${data.message}${colors.reset}`);
      console.log(`  Engine: ${data.data?.mode || 'Active Engine'}`);
      console.log(`  All transactional demo reports and assignments cleared.`);
      console.log(`  Default Admin account and baseline categories restored.\n`);
      return;
    }
  } catch (err) {
    // Fallback direct reset
  }

  const db = require('../config/db');
  const isEmbedded = db.isEmbedded();

  if (isEmbedded) {
    const edb = db.getEmbeddedDb();
    edb.resetDemoData();
    console.log(`${colors.green}✔ Embedded Database reset to clean baseline state.${colors.reset}\n`);
  } else {
    const resetPath = path.join(__dirname, '..', '..', 'database', 'demo_reset.sql');
    if (fs.existsSync(resetPath)) {
      const sql = fs.readFileSync(resetPath, 'utf8');
      const connection = await db.getConnection();
      try {
        await connection.query(sql);
      } finally {
        if (connection.release) connection.release();
      }
      console.log(`${colors.green}✔ MySQL Database reset to clean baseline state.${colors.reset}\n`);
    }
  }
}

resetDemoData().catch(err => {
  console.error('❌ Failed to reset demo data:', err);
  process.exit(1);
});
