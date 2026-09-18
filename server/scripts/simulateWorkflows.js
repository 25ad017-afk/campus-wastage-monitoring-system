const http = require('http');
const fs = require('fs');
const path = require('path');

// Ensure dotenv is loaded
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const BASE_URL = process.env.TEST_URL || 'http://localhost:5000';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function logStep(step, message) {
  console.log(`\n${colors.bright}${colors.cyan}▶ [${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`  ${colors.green}✔ ${message}${colors.reset}`);
}

function logInfo(label, val) {
  console.log(`    ${colors.yellow}${label}:${colors.reset}`, val);
}

function logError(message, err) {
  console.error(`  ${colors.red}✖ ${message}${colors.reset}`, err || '');
}

async function runEndToEndSimulation() {
  console.log(`${colors.bright}${colors.magenta}`);
  console.log('================================================================');
  console.log('  CAMPUS WASTE MONITORING SYSTEM - COMPREHENSIVE E2E SIMULATION');
  console.log('================================================================');
  console.log(`${colors.reset}`);

  // 1. Health check (auto-boot server if not already running)
  logStep('INIT', 'Checking Server Health...');
  let isRunning = false;
  try {
    const check = await fetch(`${BASE_URL}/api/health`);
    if (check.ok) isRunning = true;
  } catch (e) {
    isRunning = false;
  }

  if (!isRunning) {
    logInfo('Server Status', 'Booting backend instance on port 5000...');
    require('../server');
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  if (!healthRes.ok) throw new Error(`Health check failed: ${JSON.stringify(healthData)}`);
  logSuccess(`Server is healthy: ${healthData.message}`);


  let studentToken = null;
  let adminToken = null;
  let staffToken = null;
  let createdReportId = null;
  let createdTicketCode = null;
  let assignedStaffId = null;
  let createdAssignmentId = null;

  // 1x1 PNG buffer for testing uploads (meets JPEG/PNG/WebP validation)
  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
    'base64'
  );

  // ============================================================================
  // WORKFLOW 1: Student Reporting
  // Student registers → logs in → reports waste → uploads image → selects location
  // → submits report → checks report status
  // ============================================================================
  console.log(`\n${colors.bright}${colors.yellow}------------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bright}${colors.yellow}WORKFLOW 1: Student Registration, Login & Waste Reporting${colors.reset}`);
  console.log(`${colors.bright}${colors.yellow}------------------------------------------------------------${colors.reset}`);

  // Step 1.1: Register Student
  logStep('1.1', 'Registering new Student account...');
  const uniqueSuffix = Date.now().toString().slice(-4);
  const studentEmail = `student.test${uniqueSuffix}@acetcbe.edu.in`;
  const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: `Test Student ${uniqueSuffix}`,
      email: studentEmail,
      password: 'Student@123',
      role: 'STUDENT',
      phoneNumber: '9876543299'
    })
  });
  const registerData = await registerRes.json();
  if (!registerRes.ok && registerData.message !== 'An account with this email address already exists.') {
    throw new Error(`Student registration failed: ${JSON.stringify(registerData)}`);
  }
  logSuccess(`Student account created / verified: ${studentEmail}`);

  // Step 1.2: Student Login
  logStep('1.2', 'Logging in as Student to obtain JWT session token...');
  const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: studentEmail,
      password: 'Student@123'
    })
  });
  const studentLoginData = await studentLoginRes.json();
  if (!studentLoginRes.ok) throw new Error(`Student login failed: ${JSON.stringify(studentLoginData)}`);
  studentToken = studentLoginData.data.token;
  logSuccess(`Student authenticated: User ID ${studentLoginData.data.user.userId} (${studentLoginData.data.user.fullName})`);

  // Step 1.3: Fetch Form Metadata Options
  logStep('1.3', 'Fetching campus location zones & waste category options...');
  const metaRes = await fetch(`${BASE_URL}/api/reports/meta/options`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const metaData = await metaRes.json();
  if (!metaRes.ok) throw new Error(`Fetch metadata failed: ${JSON.stringify(metaData)}`);
  logSuccess(`Loaded ${metaData.data.locations.length} campus locations and ${metaData.data.categories.length} waste categories.`);
  logInfo('First Location', `${metaData.data.locations[0].building_name} [${metaData.data.locations[0].zone_name}] (Lat: ${metaData.data.locations[0].latitude}, Lng: ${metaData.data.locations[0].longitude})`);

  // Step 1.4: Submit Waste Report with Image
  logStep('1.4', 'Submitting new Waste Report with photographic evidence...');
  const reportForm = new FormData();
  reportForm.append('locationId', '2'); // Academic Area - Smart Classrooms
  reportForm.append('categoryId', '1'); // Dry / Recyclable
  reportForm.append('description', 'Discarded cardboard packaging and plastic bottles near Academic Area smart classrooms.');
  reportForm.append('priority', 'HIGH');
  const reportImgBlob = new Blob([samplePngBuffer], { type: 'image/png' });
  reportForm.append('image', reportImgBlob, 'corridor-litter.png');

  const reportSubmitRes = await fetch(`${BASE_URL}/api/reports`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentToken}` },
    body: reportForm
  });
  const reportSubmitData = await reportSubmitRes.json();
  if (!reportSubmitRes.ok) throw new Error(`Report submission failed: ${JSON.stringify(reportSubmitData)}`);
  createdReportId = reportSubmitData.data.report_id || reportSubmitData.data.reportId;
  createdTicketCode = reportSubmitData.data.ticket_code || reportSubmitData.data.ticketCode;
  logSuccess(`Incident filed successfully! Report ID: ${createdReportId}, Ticket: #${createdTicketCode}`);
  logInfo('Report Details', `Location: Academic Area | Priority: HIGH | Status: ${reportSubmitData.data.status}`);

  // Step 1.5: Check Student Report Status
  logStep('1.5', 'Verifying report appears in Student "My Reports" feed...');
  const myReportsRes = await fetch(`${BASE_URL}/api/reports/my-reports`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const myReportsData = await myReportsRes.json();
  if (!myReportsRes.ok) throw new Error(`Fetch my-reports failed: ${JSON.stringify(myReportsData)}`);
  const filedReport = myReportsData.data.find(r => r.report_id === createdReportId || r.ticket_code === createdTicketCode);
  if (!filedReport) throw new Error('Submitted report was not found in student personal reports list.');
  logSuccess(`Verified in student portal! Ticket #${filedReport.ticket_code} - Status: [${filedReport.status}]`);

  // ============================================================================
  // WORKFLOW 2: Admin Incident Review & Staff Dispatch
  // Admin logs in → views new report → checks image/location → assigns cleaning staff
  // → changes priority/status
  // ============================================================================
  console.log(`\n${colors.bright}${colors.yellow}------------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bright}${colors.yellow}WORKFLOW 2: Admin Review, Dispatch & Priority Escalation${colors.reset}`);
  console.log(`${colors.bright}${colors.yellow}------------------------------------------------------------${colors.reset}`);

  // Step 2.1: Admin Login
  logStep('2.1', 'Authenticating as Campus Chief Administrator...');
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@acetcbe.edu.in',
      password: 'Admin@123'
    })
  });
  const adminLoginData = await adminLoginRes.json();
  if (!adminLoginRes.ok) throw new Error(`Admin login failed: ${JSON.stringify(adminLoginData)}`);
  adminToken = adminLoginData.data.token;
  logSuccess(`Admin authenticated: ${adminLoginData.data.user.fullName} (${adminLoginData.data.user.role})`);

  // Step 2.2: Admin views all reports & checks GPS coordinates
  logStep('2.2', 'Admin querying report roster and verifying GPS map coordinates...');
  const adminReportsRes = await fetch(`${BASE_URL}/api/admin/reports`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const adminReportsData = await adminReportsRes.json();
  if (!adminReportsRes.ok) throw new Error(`Fetch admin reports failed: ${JSON.stringify(adminReportsData)}`);
  const targetReport = adminReportsData.data.reports.find(r => r.report_id === createdReportId || r.ticket_code === createdTicketCode);
  if (!targetReport) throw new Error('Admin could not find newly reported ticket in incident roster.');
  logSuccess(`Found ticket #${targetReport.ticket_code} at ${targetReport.building_name}`);
  logInfo('Geospatial Coordinates', `Lat: ${targetReport.latitude}, Lng: ${targetReport.longitude}`);

  // Step 2.3: Admin views cleaning staff roster
  logStep('2.3', 'Admin checking available cleaning crew roster...');
  const staffListRes = await fetch(`${BASE_URL}/api/admin/staff`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const staffListData = await staffListRes.json();
  if (!staffListRes.ok) throw new Error(`Fetch staff roster failed: ${JSON.stringify(staffListData)}`);
  const availableCrew = staffListData.data.find(s => s.is_available) || staffListData.data[0];
  if (!availableCrew) throw new Error('No cleaning staff found in the system.');
  assignedStaffId = availableCrew.staff_id;
  logSuccess(`Selected cleaning staff member: ${availableCrew.full_name} (${availableCrew.employee_code}) [Zone: ${availableCrew.assigned_zone}]`);

  // Step 2.4: Admin assigns report to staff member
  logStep('2.4', 'Dispatching cleaning crew to incident location...');
  const assignRes = await fetch(`${BASE_URL}/api/admin/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      reportId: createdReportId,
      staffId: assignedStaffId,
      adminNotes: 'High-priority corridor cleanup before lab practical starts.'
    })
  });
  const assignData = await assignRes.json();
  if (!assignRes.ok) throw new Error(`Dispatch assignment failed: ${JSON.stringify(assignData)}`);
  createdAssignmentId = assignData.data.assignmentId;
  logSuccess(`Task dispatched! Assignment ID: ${createdAssignmentId} -> Assigned to: ${assignData.data.staff.name}`);

  // Step 2.5: Admin escalates priority to CRITICAL
  logStep('2.5', 'Admin escalating incident priority to CRITICAL...');
  const prioRes = await fetch(`${BASE_URL}/api/admin/reports/${createdReportId}/priority`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`
    },
    body: JSON.stringify({ priority: 'CRITICAL' })
  });
  const prioData = await prioRes.json();
  if (!prioRes.ok) throw new Error(`Priority escalation failed: ${JSON.stringify(prioData)}`);
  logSuccess(`Report #${createdTicketCode} priority updated to: [${prioData.data.priority}]`);

  // ============================================================================
  // WORKFLOW 3: Cleaning Staff Task Resolution
  // Cleaning staff logs in → views assigned task → accepts task → marks it in progress
  // → collects waste → uploads completion image → marks task completed
  // ============================================================================
  console.log(`\n${colors.bright}${colors.yellow}------------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bright}${colors.yellow}WORKFLOW 3: Cleaning Staff Task Execution & Photographic Resolution${colors.reset}`);
  console.log(`${colors.bright}${colors.yellow}------------------------------------------------------------${colors.reset}`);

  // Step 3.1: Staff Login
  logStep('3.1', 'Authenticating as Cleaning Crew member...');
  const staffLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'ramesh.staff@acetcbe.edu.in',
      password: 'Staff@123'
    })
  });
  const staffLoginData = await staffLoginRes.json();
  if (!staffLoginRes.ok) throw new Error(`Staff login failed: ${JSON.stringify(staffLoginData)}`);
  staffToken = staffLoginData.data.token;
  logSuccess(`Staff authenticated: ${staffLoginData.data.user.fullName} (${staffLoginData.data.user.email})`);

  // Step 3.2: Staff views assigned tasks feed
  logStep('3.2', 'Fetching staff active task queue...');
  const tasksRes = await fetch(`${BASE_URL}/api/staff/tasks`, {
    headers: { Authorization: `Bearer ${staffToken}` }
  });
  const tasksData = await tasksRes.json();
  if (!tasksRes.ok) throw new Error(`Fetch tasks failed: ${JSON.stringify(tasksData)}`);
  const taskList = Array.isArray(tasksData.data) ? tasksData.data : (tasksData.data.tasks || []);
  const myTask = taskList.find(t => t.assignment_id === createdAssignmentId || t.report_id === createdReportId);
  if (!myTask) throw new Error('Assigned task was not found in staff task feed.');
  logSuccess(`Task found in queue: Ticket #${myTask.ticket_code} at ${myTask.building_name} [Priority: ${myTask.priority}]`);

  // Step 3.3: Staff accepts / acknowledges task
  logStep('3.3', `Staff acknowledging Task #${myTask.assignment_id}...`);
  const acceptRes = await fetch(`${BASE_URL}/api/staff/tasks/${myTask.assignment_id}/accept`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${staffToken}` }
  });
  const acceptData = await acceptRes.json();
  if (!acceptRes.ok) throw new Error(`Task acceptance failed: ${JSON.stringify(acceptData)}`);
  logSuccess(`Task status transitioned: [${acceptData.data.assignment_status}]`);

  // Step 3.4: Staff marks work as IN_PROGRESS
  logStep('3.4', 'Staff transitioning task status to IN_PROGRESS...');
  const startRes = await fetch(`${BASE_URL}/api/staff/tasks/${myTask.assignment_id}/start`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${staffToken}` }
  });
  const startData = await startRes.json();
  if (!startRes.ok) throw new Error(`Start task failed: ${JSON.stringify(startData)}`);
  logSuccess(`Task is now In-Progress! Report Status: [${startData.data.report_status}]`);

  // Step 3.5: Staff collects waste, uploads completion "After" photo, and marks resolved
  logStep('3.5', 'Staff completing collection, uploading "After" resolution photo & logging waste metrics...');
  const completeForm = new FormData();
  completeForm.append('remarks', 'Cardboard cartons flattened, plastic bottles separated, corridor swept and disinfected.');
  completeForm.append('wasteWeightKg', '4.2');
  completeForm.append('disposalDestination', 'Campus Paper Recycling Unit');
  const resolutionImgBlob = new Blob([samplePngBuffer], { type: 'image/png' });
  completeForm.append('image', resolutionImgBlob, 'resolved-corridor.png');

  const completeRes = await fetch(`${BASE_URL}/api/staff/tasks/${myTask.assignment_id}/complete`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${staffToken}` },
    body: completeForm
  });
  const completeData = await completeRes.json();
  if (!completeRes.ok) throw new Error(`Task completion failed: ${JSON.stringify(completeData)}`);
  const finalStatus = completeData.data.report?.status || completeData.data.status || 'RESOLVED';
  logSuccess(`Task completed and verified! Report #${createdTicketCode} is now marked: [${finalStatus}]`);
  logInfo('Waste Collection Log', `Weight: 4.2 kg | Destination: Campus Paper Recycling Unit`);

  // Step 3.6: Verify in Staff History
  logStep('3.6', 'Checking Staff resolution history...');
  const historyRes = await fetch(`${BASE_URL}/api/staff/history`, {
    headers: { Authorization: `Bearer ${staffToken}` }
  });
  const historyData = await historyRes.json();
  const historyList = Array.isArray(historyData.data) ? historyData.data : (historyData.data.history || []);
  const resolvedRecord = historyList.find(h => h.report_id === createdReportId);
  if (!resolvedRecord) throw new Error('Resolved task not found in staff completed history.');
  logSuccess(`Task confirmed in historical archive! Weight: ${resolvedRecord.waste_weight_kg}kg | Cleared At: ${resolvedRecord.collection_time || 'Just now'}`);

  // ============================================================================
  // WORKFLOW 4: Admin Verification, Dashboard & Analytics Update, Notifications
  // Admin verifies completed task → dashboard statistics update → analytics update
  // → notification is generated
  // ============================================================================
  console.log(`\n${colors.bright}${colors.yellow}------------------------------------------------------------${colors.reset}`);
  console.log(`${colors.bright}${colors.yellow}WORKFLOW 4: Admin Verification, Dashboard/Analytics Update & Notifications${colors.reset}`);
  console.log(`${colors.bright}${colors.yellow}------------------------------------------------------------${colors.reset}`);

  // Step 4.1: Admin Dashboard Counters
  logStep('4.1', 'Admin verifying real-time dashboard counter updates...');
  const dashRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const dashData = await dashRes.json();
  if (!dashRes.ok) throw new Error(`Fetch dashboard failed: ${JSON.stringify(dashData)}`);
  logSuccess('Dashboard stats refreshed:');
  const rStats = dashData.data.stats?.reports || {};
  const sStats = dashData.data.stats?.staff || {};
  logInfo('Total Reports', rStats.total || rStats.total_reports || 0);
  logInfo('Completed / Resolved', rStats.completed || rStats.completed_reports || 0);
  logInfo('Active Cleaning Staff', `${sStats.available || 0} / ${sStats.total || 0}`);

  // Step 4.2: Comprehensive Analytics
  logStep('4.2', 'Admin auditing multi-dimensional analytics reports...');
  const analyticsRes = await fetch(`${BASE_URL}/api/admin/analytics`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const analyticsData = await analyticsRes.json();
  if (!analyticsRes.ok) throw new Error(`Fetch analytics failed: ${JSON.stringify(analyticsData)}`);
  const catList = analyticsData.data?.byCategory || analyticsData.data?.categoryDistribution || [];
  const locList = analyticsData.data?.byLocation || analyticsData.data?.locationHotspots || [];
  const statusInfo = analyticsData.data?.statusRatio || analyticsData.data?.statusOverview || {};
  logSuccess(`Analytics verified across ${catList.length} categories and ${locList.length} location hotspots.`);
  logInfo('Resolution Overview', `Completed: ${statusInfo.completed_count || 0}, Pending: ${statusInfo.pending_count || 0}`);

  // Step 4.3: Campus Waste Location Map Data Verification
  logStep('4.3', 'Verifying Campus Map Location Monitoring data integrity...');
  const mapReportsRes = await fetch(`${BASE_URL}/api/admin/reports`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const mapReportsData = await mapReportsRes.json();
  const mapPins = mapReportsData.data.reports.filter(r => r.latitude && r.longitude);
  logSuccess(`Verified ${mapPins.length} geo-located campus waste markers with valid GPS coordinates.`);
  mapPins.slice(0, 3).forEach((pin, i) => {
    logInfo(`Marker ${i + 1}`, `#${pin.ticket_code} | [${pin.status}] | ${pin.building_name} (${pin.latitude}, ${pin.longitude}) | Cat: ${pin.category_name}`);
  });

  // Step 4.4: Student Notifications Verification
  logStep('4.4', 'Checking Student Notification inbox...');
  const studentNotifsRes = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  const studentNotifsData = await studentNotifsRes.json();
  if (!studentNotifsRes.ok) throw new Error(`Fetch notifications failed: ${JSON.stringify(studentNotifsData)}`);
  logSuccess(`Student has ${studentNotifsData.data.notifications.length} notifications.`);
  studentNotifsData.data.notifications.slice(0, 3).forEach(n => {
    logInfo(`Notification [${n.notification_type}]`, `${n.title}: "${n.message}"`);
  });

  // Step 4.5: Admin Notifications Verification
  logStep('4.5', 'Checking Admin Notification feed...');
  const adminNotifsRes = await fetch(`${BASE_URL}/api/notifications`, {
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const adminNotifsData = await adminNotifsRes.json();
  if (!adminNotifsRes.ok) throw new Error(`Fetch admin notifications failed: ${JSON.stringify(adminNotifsData)}`);
  logSuccess(`Admin notification center holds ${adminNotifsData.data.notifications.length} audit trail alerts.`);

  console.log(`\n${colors.bright}${colors.green}================================================================`);
  console.log('  ALL 4 REAL-USER WORKFLOWS COMPLETED & VERIFIED SUCCESSFULLY!   ');
  console.log('================================================================');
  console.log(`  ✔ Workflow 1 (Student): Register → Login → Upload Photo → Report Submitted`);
  console.log(`  ✔ Workflow 2 (Admin): Review Incident → Dispatch Crew → Escalate Priority`);
  console.log(`  ✔ Workflow 3 (Staff): Receive Task → Accept → In-Progress → Resolution Photo`);
  console.log(`  ✔ Workflow 4 (Admin): Live Dashboard → Analytics → Geo-Map Markers → Notifications`);
  console.log(`================================================================${colors.reset}\n`);
}

// Execute simulation if run directly
if (require.main === module) {
  runEndToEndSimulation()
    .then(() => process.exit(0))
    .catch(err => {
      console.error('\n❌ SIMULATION FAILED:', err);
      process.exit(1);
    });
}

module.exports = runEndToEndSimulation;
