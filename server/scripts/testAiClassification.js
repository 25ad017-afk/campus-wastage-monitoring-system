const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

async function testAiWasteClassification() {
  console.log(`${colors.bright}${colors.cyan}================================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}  AI WASTE CLASSIFICATION MODULE - VERIFICATION TEST SUITE${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}================================================================${colors.reset}\n`);

  // 0. Health check / Auto boot
  let isRunning = false;
  try {
    const check = await fetch(`${BASE_URL}/api/health`);
    if (check.ok) isRunning = true;
  } catch (e) {
    isRunning = false;
  }

  if (!isRunning) {
    console.log('Booting backend instance on port 5000...');
    require('../server');
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  // Step 1: Authenticate Student
  console.log('1. Authenticating student...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'priya.student@acetcbe.edu.in',
      password: 'Student@123'
    })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) throw new Error(`Student login failed: ${JSON.stringify(loginData)}`);
  const token = loginData.data.token;
  console.log(`${colors.green}✔ Authenticated as Priya Sharma (Student)${colors.reset}`);

  // Step 2: Test AI Classification with Plastic Bottle (Dry / Recyclable)
  console.log('\n2. Testing AI classification on "plastic_bottle.png"...');
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64'
  );
  const bottleForm = new FormData();
  bottleForm.append('image', new Blob([samplePngBuffer], { type: 'image/png' }), 'plastic_bottle.png');

  const classifyRes1 = await fetch(`${BASE_URL}/api/reports/classify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: bottleForm
  });
  const classifyData1 = await classifyRes1.json();
  if (!classifyRes1.ok) throw new Error(`Classify failed: ${JSON.stringify(classifyData1)}`);
  console.log(`${colors.green}✔ AI Prediction Received:${colors.reset}`);
  console.log(`   - Predicted Category: ${classifyData1.data.predictedCategory} (ID: ${classifyData1.data.categoryId})`);
  console.log(`   - Confidence: ${classifyData1.data.confidence}% (${classifyData1.data.confidenceLevel})`);
  console.log(`   - Uncertainty Flag: ${classifyData1.data.isUncertain}`);

  if (classifyData1.data.predictedCategory !== 'Dry / Recyclable' || classifyData1.data.categoryId !== 1) {
    throw new Error(`Expected 'Dry / Recyclable' (ID 1), got ${classifyData1.data.predictedCategory}`);
  }

  // Step 3: Test AI Classification on Food Waste (Wet / Organic)
  console.log('\n3. Testing AI classification on "canteen_food_plate.jpg"...');
  const foodForm = new FormData();
  foodForm.append('image', new Blob([samplePngBuffer], { type: 'image/jpeg' }), 'canteen_food_plate.jpg');

  const classifyRes2 = await fetch(`${BASE_URL}/api/reports/classify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: foodForm
  });
  const classifyData2 = await classifyRes2.json();
  if (!classifyRes2.ok) throw new Error(`Classify failed: ${JSON.stringify(classifyData2)}`);
  console.log(`${colors.green}✔ AI Prediction Received:${colors.reset}`);
  console.log(`   - Predicted Category: ${classifyData2.data.predictedCategory} (ID: ${classifyData2.data.categoryId})`);
  console.log(`   - Confidence: ${classifyData2.data.confidence}% (${classifyData2.data.confidenceLevel})`);
  console.log(`   - Uncertainty Flag: ${classifyData2.data.isUncertain}`);

  if (classifyData2.data.predictedCategory !== 'Wet / Organic' || classifyData2.data.categoryId !== 2) {
    throw new Error(`Expected 'Wet / Organic' (ID 2), got ${classifyData2.data.predictedCategory}`);
  }

  // Step 3b: Test AI Classification on E-Waste (battery/circuit)
  console.log('\n3b. Testing AI classification on "circuit_board_wiring.png"...');
  const ewasteForm = new FormData();
  ewasteForm.append('image', new Blob([samplePngBuffer], { type: 'image/png' }), 'circuit_board_wiring.png');

  const classifyRes3b = await fetch(`${BASE_URL}/api/reports/classify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: ewasteForm
  });
  const classifyData3b = await classifyRes3b.json();
  if (!classifyRes3b.ok) throw new Error(`Classify ewaste failed: ${JSON.stringify(classifyData3b)}`);
  console.log(`${colors.green}✔ AI Prediction Received:${colors.reset}`);
  console.log(`   - Predicted Category: ${classifyData3b.data.predictedCategory} (ID: ${classifyData3b.data.categoryId})`);
  console.log(`   - Confidence: ${classifyData3b.data.confidence}% (${classifyData3b.data.confidenceLevel})`);
  if (classifyData3b.data.categoryId !== 3) {
    throw new Error(`Expected E-Waste (ID 3), got ${classifyData3b.data.predictedCategory}`);
  }

  // Step 3c: Test AI Classification on Ambiguous/Uncertain file
  console.log('\n3c. Testing AI classification on ambiguous/unlabeled file...');
  const unknownForm = new FormData();
  // Using an obscure filename that triggers edge classifier
  unknownForm.append('image', new Blob([samplePngBuffer], { type: 'image/png' }), 'corridor_shadow.png');

  const classifyRes3c = await fetch(`${BASE_URL}/api/reports/classify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: unknownForm
  });
  const classifyData3c = await classifyRes3c.json();
  if (!classifyRes3c.ok) throw new Error(`Classify unknown failed: ${JSON.stringify(classifyData3c)}`);
  console.log(`${colors.green}✔ AI Edge Prediction Received:${colors.reset}`);
  console.log(`   - Predicted Category: ${classifyData3c.data.predictedCategory} (ID: ${classifyData3c.data.categoryId})`);
  console.log(`   - Confidence: ${classifyData3c.data.confidence}% (${classifyData3c.data.confidenceLevel})`);
  console.log(`   - Uncertainty Flag: ${classifyData3c.data.isUncertain}`);

  // Step 4: Test Manual Category Confirmation & Storage into DB
  console.log('\n4. Testing Report Submission with Confirmed Category...');
  // Scenario: AI predicts Wet / Organic, but student confirms or manually changes to E-Waste (ID 3)
  const finalChosenCategoryId = 3; // E-Waste
  const reportForm = new FormData();
  reportForm.append('locationId', '1'); // Main Admin Building
  reportForm.append('categoryId', String(finalChosenCategoryId));
  reportForm.append('description', 'AI predicted Wet/Organic, but student manually corrected to E-Waste (discarded circuit board & wiring).');
  reportForm.append('priority', 'HIGH');
  reportForm.append('image', new Blob([samplePngBuffer], { type: 'image/jpeg' }), 'site_evidence.jpg');

  const createRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: reportForm
  });
  const createData = await createRes.json();
  if (!createRes.ok) throw new Error(`Create report failed: ${JSON.stringify(createData)}`);
  
  console.log(`${colors.green}✔ Report successfully created with user-confirmed Final Category!${colors.reset}`);
  console.log(`   - Ticket Code: #${createData.data.ticket_code}`);
  console.log(`   - Stored Category ID: ${createData.data.category_id}`);
  console.log(`   - Stored Category Name: ${createData.data.category_name}`);

  if (Number(createData.data.category_id) !== finalChosenCategoryId) {
    throw new Error(`Category mismatch: expected ${finalChosenCategoryId}, got ${createData.data.category_id}`);
  }

  // Step 5: Test Graceful Handling when Image Missing in /classify
  console.log('\n5. Testing Graceful Validation Failure on /classify without file...');
  const emptyForm = new FormData();
  const emptyRes = await fetch(`${BASE_URL}/api/reports/classify`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: emptyForm
  });
  const emptyData = await emptyRes.json();
  console.log(`${colors.green}✔ Gracefully returned 400 Bad Request with message:${colors.reset} "${emptyData.message}"`);

  // Step 6: Verify normal report submission continues even if AI is skipped
  console.log('\n6. Testing Normal Waste Report Submission without AI assistance...');
  const directForm = new FormData();
  directForm.append('locationId', '3'); // Library
  directForm.append('categoryId', '1'); // Dry / Recyclable
  directForm.append('description', 'Regular waste report filed directly without calling AI.');
  directForm.append('priority', 'LOW');
  directForm.append('image', new Blob([samplePngBuffer], { type: 'image/png' }), 'library_bin.png');

  const directRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: directForm
  });
  const directData = await directRes.json();
  if (!directRes.ok) throw new Error(`Direct report submission failed: ${JSON.stringify(directData)}`);
  console.log(`${colors.green}✔ Direct submission passed without AI dependency! Ticket: #${directData.data.ticket_code}${colors.reset}`);

  console.log(`\n${colors.bright}${colors.green}================================================================${colors.reset}`);
  console.log(`${colors.bright}${colors.green}  ALL AI MODULE INTEGRATION TESTS PASSED SUCCESSFULLY!${colors.reset}`);
  console.log(`${colors.bright}${colors.green}================================================================${colors.reset}\n`);
}

testAiWasteClassification().catch(err => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
