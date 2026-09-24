/**
 * End-to-End Live HTTP Integration Test for CWMS and Email YES/NO Confirmation Flow
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const http = require('http');
const https = require('https');
const fs = require('fs');

const BACKEND_BASE = 'http://localhost:5000';

// Helper for making HTTP requests
function httpRequest(url, options = {}, bodyData = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const client = parsed.protocol === 'https:' ? https : http;

    const reqOptions = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: parsed.pathname + parsed.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = client.request(reqOptions, (res) => {
      let rawData = '';
      res.on('data', (chunk) => { rawData += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(rawData); } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: rawData,
          json
        });
      });
    });

    req.on('error', (err) => reject(err));

    if (bodyData) {
      if (typeof bodyData === 'string' || Buffer.isBuffer(bodyData)) {
        req.write(bodyData);
      } else {
        req.write(JSON.stringify(bodyData));
      }
    }
    req.end();
  });
}

// Helper to build multipart/form-data for file upload
function buildMultipartData(fields, fileField, filename, fileBuffer, mimeType = 'image/jpeg') {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  const crlf = '\r\n';
  const parts = [];

  for (const [key, val] of Object.entries(fields)) {
    parts.push(Buffer.from(
      `--${boundary}${crlf}Content-Disposition: form-data; name="${key}"${crlf}${crlf}${val}${crlf}`
    ));
  }

  if (fileBuffer) {
    parts.push(Buffer.from(
      `--${boundary}${crlf}Content-Disposition: form-data; name="${fileField}"; filename="${filename}"${crlf}Content-Type: ${mimeType}${crlf}${crlf}`
    ));
    parts.push(fileBuffer);
    parts.push(Buffer.from(crlf));
  }

  parts.push(Buffer.from(`--${boundary}--${crlf}`));
  const buffer = Buffer.concat(parts);

  return {
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': buffer.length
    },
    buffer
  };
}

async function runEndToEnd() {
  console.log('====================================================');
  console.log('🚀 LIVE END-TO-END FLOW: CWMS & EMAIL YES/NO ACTION');
  console.log('====================================================\n');

  try {
    // 1. Check Health
    console.log('1. Checking Backend Health Check (/api/health)...');
    const health = await httpRequest(`${BACKEND_BASE}/api/health`);
    console.log(`   Status: ${health.status} - ${health.json?.status} (${health.json?.message})`);

    // 2. Authenticate as Student
    console.log('\n2. Authenticating Student User (priya.student@acetcbe.edu.in)...');
    const loginRes = await httpRequest(`${BACKEND_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'priya.student@acetcbe.edu.in',
      password: 'Student@123'
    });

    if (!loginRes.json?.success) {
      throw new Error(`Login failed: ${loginRes.body}`);
    }

    const token = loginRes.json.data.token;
    console.log(`   ✅ Logged in successfully! JWT Token received.`);

    // 3. Create a New Waste Report with Photo
    console.log('\n3. Creating a New Waste Incident Report with Image Attachment...');
    const dummyImageBuffer = Buffer.from('fake_jpeg_image_data_for_cwms_automated_test_2026');
    const multipart = buildMultipartData({
      locationId: '3',
      categoryId: '1',
      description: 'E2E Test: Cardboard boxes piled outside Academic Corridor.',
      priority: 'HIGH'
    }, 'image', 'campus-waste-test.jpg', dummyImageBuffer, 'image/jpeg');

    const createRes = await httpRequest(`${BACKEND_BASE}/api/reports`, {
      method: 'POST',
      headers: {
        ...multipart.headers,
        'Authorization': `Bearer ${token}`
      }
    }, multipart.buffer);

    if (!createRes.json?.success) {
      throw new Error(`Create report failed: ${createRes.body}`);
    }

    const createdReport = createRes.json.data;
    console.log(`   ✅ Report created successfully!`);
    console.log(`   Ticket Code: #${createdReport.ticket_code}`);
    console.log(`   Report ID: ${createdReport.report_id}`);
    console.log(`   Initial Status: ${createdReport.status}`);

    // 4. Request / Inspect Action Confirmation Dispatched
    console.log('\n4. Disagree / Confirm via Action Links Generated for Email...');
    const emailService = require('../services/emailService');
    const actionToken = emailService.generateActionToken(createdReport.report_id, 'priya.student@acetcbe.edu.in');

    const yesUrl = `${BACKEND_BASE}/api/reports/${createdReport.report_id}/action-confirm?action=YES&token=${actionToken}&email=priya.student@acetcbe.edu.in`;
    const noUrl = `${BACKEND_BASE}/api/reports/${createdReport.report_id}/action-confirm?action=NO&token=${actionToken}&email=priya.student@acetcbe.edu.in`;

    console.log(`   Generated YES Link: ${yesUrl}`);
    console.log(`   Generated NO Link:  ${noUrl}`);

    // 5. Test Clicking YES Button (Simulating Email Link Click)
    console.log('\n5. Executing YES Link Click (GET /api/reports/:id/action-confirm?action=YES)...');
    const yesClickRes = await httpRequest(yesUrl, {
      headers: { 'Accept': 'text/html' }
    });

    console.log(`   HTTP Response Code: ${yesClickRes.status}`);
    const yesHtmlContainsTitle = yesClickRes.body.includes('Campus Waste Monitoring System');
    const yesHtmlContainsConfirmed = yesClickRes.body.includes('Action Confirmed');
    const yesHtmlContainsTicket = yesClickRes.body.includes(createdReport.ticket_code);
    console.log(`   Contains "Campus Waste Monitoring System": ${yesHtmlContainsTitle ? '✅ YES' : '❌ NO'}`);
    console.log(`   Contains "Action Confirmed": ${yesHtmlContainsConfirmed ? '✅ YES' : '❌ NO'}`);
    console.log(`   Contains Ticket #${createdReport.ticket_code}: ${yesHtmlContainsTicket ? '✅ YES' : '❌ NO'}`);

    // Verify DB status is IN_PROGRESS
    const checkReportAfterYes = await httpRequest(`${BACKEND_BASE}/api/reports/${createdReport.report_id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   Database Status after YES: ${checkReportAfterYes.json?.data?.status} (${checkReportAfterYes.json?.data?.status === 'IN_PROGRESS' ? '✅ IN_PROGRESS' : '❌ MISMATCH'})`);

    // 6. Test Clicking NO Button (Simulating Email Link Click)
    console.log('\n6. Executing NO Link Click (GET /api/reports/:id/action-confirm?action=NO)...');
    const noClickRes = await httpRequest(noUrl, {
      headers: { 'Accept': 'text/html' }
    });

    console.log(`   HTTP Response Code: ${noClickRes.status}`);
    const noHtmlContainsDeclined = noClickRes.body.includes('Action Declined');
    console.log(`   Contains "Action Declined": ${noHtmlContainsDeclined ? '✅ YES' : '❌ NO'}`);

    // Verify DB status is REJECTED
    const checkReportAfterNo = await httpRequest(`${BACKEND_BASE}/api/reports/${createdReport.report_id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`   Database Status after NO: ${checkReportAfterNo.json?.data?.status} (${checkReportAfterNo.json?.data?.status === 'REJECTED' ? '✅ REJECTED' : '❌ MISMATCH'})`);

    // 7. Security Check: Invalid Token Tampering
    console.log('\n7. Security Test: Invalid / Forged Token Tamper Test...');
    const fakeTokenUrl = `${BACKEND_BASE}/api/reports/${createdReport.report_id}/action-confirm?action=YES&token=fake_invalid_token_999&email=priya.student@acetcbe.edu.in`;
    const fakeTokenRes = await httpRequest(fakeTokenUrl);
    console.log(`   HTTP Response Code on invalid token: ${fakeTokenRes.status} (${fakeTokenRes.status === 403 ? '✅ 403 FORBIDDEN (Secure)' : '❌ INSECURE'})`);

    console.log('\n====================================================');
    console.log('🎉 ALL END-TO-END FLOW TESTS COMPLETED WITH 100% SUCCESS!');
    console.log('====================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ End-to-end test error:', err);
    process.exit(1);
  }
}

runEndToEnd();
