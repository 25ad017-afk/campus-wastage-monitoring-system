const PROD_URL = 'https://campus-wastage-monitoring-system.vercel.app';

async function testProduction() {
  console.log('=====================================================');
  console.log('🌐 TESTING LIVE VERCEL PRODUCTION AUTHENTICATION');
  console.log(`🎯 URL: ${PROD_URL}`);
  console.log('=====================================================\n');

  // 1. Email Status & Auth Mode Flag
  console.log('▶️ [TEST 1] Checking /api/auth/email-status');
  const statusRes = await fetch(`${PROD_URL}/api/auth/email-status`);
  const statusJson = await statusRes.json();
  console.log('Status Code:', statusRes.status);
  console.log('demoAuthMode:', statusJson.data?.demoAuthMode);
  console.log('mode:', statusJson.data?.mode);
  if (!statusJson.data?.demoAuthMode) {
    throw new Error('Expected demoAuthMode to be true on production');
  }

  // 2. Student Login (No OTP)
  console.log('\n▶️ [TEST 2] Testing Student Login without OTP');
  const studentRes = await fetch(`${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'priya.student@acetcbe.edu.in',
      password: 'Student@123',
      role: 'STUDENT'
    })
  });
  const studentJson = await studentRes.json();
  console.log('Student Login Status:', studentRes.status);
  console.log('Student Role:', studentJson.data?.user?.role);
  console.log('Token Received:', !!studentJson.data?.token);
  if (studentRes.status !== 200 || studentJson.data?.user?.role !== 'STUDENT') {
    throw new Error('Student login failed on production');
  }

  // 3. Staff Login (No OTP)
  console.log('\n▶️ [TEST 3] Testing Staff Login without OTP');
  const staffRes = await fetch(`${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'ramesh.staff@acetcbe.edu.in',
      password: 'Staff@123',
      role: 'STAFF'
    })
  });
  const staffJson = await staffRes.json();
  console.log('Staff Login Status:', staffRes.status);
  console.log('Staff Role:', staffJson.data?.user?.role);
  console.log('Token Received:', !!staffJson.data?.token);
  if (staffRes.status !== 200 || staffJson.data?.user?.role !== 'STAFF') {
    throw new Error('Staff login failed on production');
  }

  // 4. Admin Login (No OTP)
  console.log('\n▶️ [TEST 4] Testing Admin Login without OTP');
  const adminRes = await fetch(`${PROD_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@acetcbe.edu.in',
      password: 'Admin@123',
      role: 'STAFF'
    })
  });
  const adminJson = await adminRes.json();
  console.log('Admin Login Status:', adminRes.status);
  console.log('Admin Role:', adminJson.data?.user?.role);
  console.log('Token Received:', !!adminJson.data?.token);
  if (adminRes.status !== 200 || adminJson.data?.user?.role !== 'ADMIN') {
    throw new Error('Admin login failed on production');
  }

  // 5. Test Access to Protected Endpoint using issued JWT
  console.log('\n▶️ [TEST 5] Verifying Protected /api/auth/me with Student JWT');
  const meRes = await fetch(`${PROD_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${studentJson.data.token}` }
  });
  const meJson = await meRes.json();
  console.log('Profile /me Status:', meRes.status);
  console.log('Authenticated User:', meJson.data?.fullName, `(${meJson.data?.email})`);
  if (meRes.status !== 200 || meJson.data?.email !== 'priya.student@acetcbe.edu.in') {
    throw new Error('JWT authentication verification failed');
  }

  // 6. Test Demo Registration (No OTP)
  console.log('\n▶️ [TEST 6] Testing New Registration in Demo Mode');
  const newEmail = `prod.demo.${Date.now()}@acetcbe.edu.in`;
  const regRes = await fetch(`${PROD_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Live Demo Evaluator',
      email: newEmail,
      password: 'DemoPassword@123',
      role: 'STUDENT',
      phoneNumber: '9876543210'
    })
  });
  const regJson = await regRes.json();
  console.log('Register Status:', regRes.status);
  console.log('Registered User:', regJson.data?.user?.email);
  if (regRes.status !== 201 || !regJson.data?.token) {
    throw new Error('Registration failed on production');
  }

  console.log('\n=====================================================');
  console.log('🎉 ALL LIVE PRODUCTION TESTS PASSED WITH 100% SUCCESS!');
  console.log('=====================================================');
}

testProduction().catch((err) => {
  console.error('❌ Production test failed:', err);
  process.exit(1);
});
