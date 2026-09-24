const http = require('http');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const app = require('../server');
const OtpModel = require('../models/otpModel');

async function runTests() {
  console.log('=====================================================');
  console.log('🧪 TESTING DEMO AUTH MODE VS REAL OTP AUTH FLOW');
  console.log('=====================================================\n');

  const server = http.createServer(app);
  const PORT = 5098;

  await new Promise((resolve) => {
    server.listen(PORT, () => {
      console.log(`Test server running on port ${PORT}`);
      resolve();
    });
  });

  const BASE_URL = `http://127.0.0.1:${PORT}`;

  try {
    // ==========================================
    // TEST PART 1: DEMO_AUTH_MODE = true
    // ==========================================
    process.env.DEMO_AUTH_MODE = 'true';
    console.log('\n▶️ [PART 1] Testing with DEMO_AUTH_MODE = true');

    // 1.1 Check email-status returns demoAuthMode = true
    const statusRes = await fetch(`${BASE_URL}/api/auth/email-status`);
    const statusData = await statusRes.json();
    console.log('1.1 GET /api/auth/email-status status:', statusRes.status);
    console.log('    demoAuthMode:', statusData.data.demoAuthMode);
    if (!statusData.data.demoAuthMode) {
      throw new Error('Expected demoAuthMode to be true in status endpoint');
    }

    // 1.2 Test Student Login without OTP
    const studentLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'priya.student@acetcbe.edu.in',
        password: 'Student@123',
        role: 'STUDENT'
      })
    });
    const studentData = await studentLoginRes.json();
    console.log('1.2 Student Login (No OTP) Status:', studentLoginRes.status);
    console.log('    Success:', studentData.success);
    console.log('    User Role:', studentData.data?.user?.role);
    console.log('    Has Token:', !!studentData.data?.token);
    if (studentLoginRes.status !== 200 || !studentData.data?.token) {
      throw new Error('Student login failed in Demo Auth Mode');
    }

    // 1.3 Test Staff Login without OTP
    const staffLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ramesh.staff@acetcbe.edu.in',
        password: 'Staff@123',
        role: 'STAFF'
      })
    });
    const staffData = await staffLoginRes.json();
    console.log('1.3 Staff Login (No OTP) Status:', staffLoginRes.status);
    console.log('    User Role:', staffData.data?.user?.role);
    if (staffLoginRes.status !== 200 || !staffData.data?.token) {
      throw new Error('Staff login failed in Demo Auth Mode');
    }

    // 1.4 Test Admin Login without OTP
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@acetcbe.edu.in',
        password: 'Admin@123',
        role: 'STAFF'
      })
    });
    const adminData = await adminLoginRes.json();
    console.log('1.4 Admin Login (No OTP) Status:', adminLoginRes.status);
    console.log('    User Role:', adminData.data?.user?.role);
    if (adminLoginRes.status !== 200 || !adminData.data?.token) {
      throw new Error('Admin login failed in Demo Auth Mode');
    }

    // 1.5 Test New Registration in Demo Mode (No OTP)
    const demoStudentEmail = `demo.tester.${Date.now()}@acetcbe.edu.in`;
    const registerRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Demo Test Student',
        email: demoStudentEmail,
        password: 'Password@123',
        role: 'STUDENT',
        phoneNumber: '9876543210'
      })
    });
    const registerData = await registerRes.json();
    console.log('1.5 Registration (No OTP) Status:', registerRes.status);
    console.log('    Registered Email:', registerData.data?.user?.email);
    if (registerRes.status !== 201 || !registerData.data?.token) {
      throw new Error('Registration failed in Demo Auth Mode');
    }

    console.log('\n✅ ALL DEMO_AUTH_MODE=true TESTS PASSED!\n');

    // ==========================================
    // TEST PART 2: DEMO_AUTH_MODE = false (Real OTP enforcement)
    // ==========================================
    process.env.DEMO_AUTH_MODE = 'false';
    console.log('▶️ [PART 2] Testing with DEMO_AUTH_MODE = false');

    // 2.1 Check email-status returns demoAuthMode = false
    const realStatusRes = await fetch(`${BASE_URL}/api/auth/email-status`);
    const realStatusData = await realStatusRes.json();
    console.log('2.1 GET /api/auth/email-status demoAuthMode:', realStatusData.data.demoAuthMode);
    if (realStatusData.data.demoAuthMode !== false) {
      throw new Error('Expected demoAuthMode to be false');
    }

    // 2.2 Attempt login without OTP -> Should be rejected with 401
    const noOtpRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'priya.student@acetcbe.edu.in',
        password: 'Student@123',
        role: 'STUDENT'
      })
    });
    const noOtpData = await noOtpRes.json();
    console.log('2.2 Login without OTP in Real Mode Status:', noOtpRes.status, '(Expected 401)');
    console.log('    Message:', noOtpData.message);
    if (noOtpRes.status !== 401) {
      throw new Error('Expected 401 when attempting login without OTP in real mode');
    }

    // 2.3 Provide valid OTP into OtpStore and login
    const knownOtp = '654321';
    OtpModel.saveOtp({ email: 'priya.student@acetcbe.edu.in', otp: knownOtp, role: 'STUDENT' });
    const withOtpRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'priya.student@acetcbe.edu.in',
        password: 'Student@123',
        role: 'STUDENT',
        otp: knownOtp
      })
    });
    const withOtpData = await withOtpRes.json();
    console.log('2.3 Login with Valid OTP Status:', withOtpRes.status, '(Expected 200)');
    console.log('    Has Token:', !!withOtpData.data?.token);
    if (withOtpRes.status !== 200 || !withOtpData.data?.token) {
      throw new Error('Expected successful login when providing valid OTP in real mode');
    }

    console.log('\n✅ ALL DEMO_AUTH_MODE=false TESTS PASSED!\n');

    // Restore env variable to true for the user demo
    process.env.DEMO_AUTH_MODE = 'true';
    console.log('🎉 ALL INTEGRATION VERIFICATION TESTS PASSED SUCCESSFULLY!');
  } finally {
    server.close();
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});
