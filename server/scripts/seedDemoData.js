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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function ensureSampleImages() {
  const b = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=', 'base64');
  const repDir = path.join(__dirname, '..', 'uploads', 'reports');
  const resDir = path.join(__dirname, '..', 'uploads', 'resolutions');
  if (!fs.existsSync(repDir)) fs.mkdirSync(repDir, { recursive: true });
  if (!fs.existsSync(resDir)) fs.mkdirSync(resDir, { recursive: true });

  const reportImgs = [
    'sample-cartons.jpg', 'sample-chemical.jpg', 'sample-sports.jpg',
    'sample-cafeteria.jpg', 'sample-hostel.jpg', 'sample-ewaste.jpg',
    'sample-workshop.jpg', 'sample-library.jpg', 'sample-foodcourt.jpg',
    'sample-garden.jpg', 'sample-cables.jpg', 'sample-hazard.jpg'
  ];
  const resImgs = [
    'sample-resolved.jpg', 'sample-library-clean.jpg', 'sample-foodcourt-clean.jpg',
    'sample-garden-clean.jpg', 'sample-cables-clean.jpg', 'sample-hazard-clean.jpg'
  ];

  reportImgs.forEach(f => {
    const p = path.join(repDir, f);
    if (!fs.existsSync(p)) fs.writeFileSync(p, b);
  });
  resImgs.forEach(f => {
    const p = path.join(resDir, f);
    if (!fs.existsSync(p)) fs.writeFileSync(p, b);
  });
}

async function seedDemoData() {
  ensureSampleImages();
  console.log(`${colors.bright}${colors.cyan}`);
  console.log('================================================================');
  console.log('  CAMPUS WASTE MONITORING SYSTEM (CWMS) - DEMO MODE ACTIVATION  ');
  console.log('  Purpose: Viva & Project Guide Demonstration                   ');
  console.log('================================================================');
  console.log(`${colors.reset}`);

  try {
    // 1. Attempt API seeding if server is running
    const res = await fetch(`${BASE_URL}/api/demo/seed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (res.ok) {
      const data = await res.json();
      printSuccessReport(data.data);
      return;
    }
  } catch (err) {
    // If server is not running, run directly via embedded/MySQL config
  }

  // Direct standalone seeding fallback
  console.log('📡 Running standalone demo seeding...');
  const db = require('../config/db');
  const isEmbedded = db.isEmbedded();

  if (isEmbedded) {
    const edb = db.getEmbeddedDb();
    const result = edb.loadDemoData();
    printSuccessReport({ mode: 'Embedded Database (Zero-Crash Engine)', ...result });
  } else {
    const demoSeedPath = path.join(__dirname, '..', '..', 'database', 'demo_seed.sql');
    if (fs.existsSync(demoSeedPath)) {
      const sql = fs.readFileSync(demoSeedPath, 'utf8');
      const connection = await db.getConnection();
      try {
        await connection.query(sql);
      } finally {
        if (connection.release) connection.release();
      }
      printSuccessReport({
        mode: 'MySQL Database',
        reportsCount: 12,
        usersCount: 9,
        staffCount: 4,
        locationsCount: 10
      });
    }
  }
}

function printSuccessReport(data) {
  console.log(`${colors.green}✔ DEMO DATA LOADED SUCCESSFULLY!${colors.reset}`);
  console.log(`  Engine Mode:     ${colors.bright}${data.mode || 'Active Engine'}${colors.reset}`);
  console.log(`  Reports Loaded:  ${colors.bright}${data.reportsCount || 12} realistic campus incidents${colors.reset}`);
  console.log(`  Students Loaded: ${colors.bright}4 active student accounts${colors.reset}`);
  console.log(`  Staff Loaded:    ${colors.bright}4 cleaning crew members (North, Central, South, East zones)${colors.reset}`);
  console.log(`  Campus Sites:    ${colors.bright}10 GPS-verified locations on Leaflet GIS Map${colors.reset}`);

  console.log(`\n${colors.bright}${colors.yellow}================================================================`);
  console.log('  DEMO ACCOUNTS FOR PROJECT GUIDE EVALUATION:');
  console.log('================================================================');
  console.log(`  1. CAMPUS ADMINISTRATOR (Full Command Center & Map)`);
  console.log(`     Email:    admin@acetcbe.edu.in`);
  console.log(`     Password: Admin@123`);
  console.log(`     Demo:     Triage new reports, assign staff, view GIS map & analytics\n`);

  console.log(`  2. STUDENT - Priya Sharma (CSE Dept)`);
  console.log(`     Email:    priya.student@acetcbe.edu.in`);
  console.log(`     Password: Student@123`);
  console.log(`     Demo:     Report waste incident with AI vision auto-classification\n`);

  console.log(`  3. CLEANING STAFF - Ramesh Kumar (North Zone Crew)`);
  console.log(`     Email:    ramesh.staff@acetcbe.edu.in`);
  console.log(`     Password: Staff@123`);
  console.log(`     Demo:     Accept task, mark in-progress, submit after-photo & weight\n`);

  console.log(`  4. CLEANING STAFF - Sunita Devi (Central Zone Crew)`);
  console.log(`     Email:    sunita.staff@acetcbe.edu.in`);
  console.log(`     Password: Staff@123`);
  console.log(`     Demo:     Cafeteria and food court cleanup task lifecycle`);

  console.log(`================================================================${colors.reset}`);
  console.log(`${colors.cyan}To reset database back to baseline anytime, run: npm run demo:reset${colors.reset}\n`);
}

seedDemoData().catch(err => {
  console.error('❌ Failed to seed demo data:', err);
  process.exit(1);
});
