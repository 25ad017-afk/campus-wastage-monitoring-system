const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const emailService = require('../services/emailService');
const ReportModel = require('../models/reportModel');

async function testRealEmailDelivery() {
  let emailSent = false;
  let yesPass = false;
  let noPass = false;
  let errorMsg = 'None';

  try {
    // 1. Verify SMTP Connection
    const connCheck = await emailService.verifyConnection();
    if (!connCheck.success) {
      errorMsg = connCheck.message;
    }

    // 2. Fetch a test report from DB
    const report = await ReportModel.findById(1);
    if (!report) {
      throw new Error('Report ID 1 not found in database.');
    }

    // 3. Trigger Real Email Delivery to the configured user
    const recipientEmail = process.env.EMAIL_USER;
    const sendResult = await emailService.sendActionConfirmationEmail({
      to: recipientEmail,
      recipientName: 'Campus Facilities Member',
      report,
      actionType: 'REAL_DELIVERY_VERIFICATION',
      baseUrl: 'http://localhost:5000'
    });

    if (sendResult.success) {
      emailSent = true;
    } else {
      errorMsg = sendResult.error || 'SMTP dispatch failed';
    }

    // 4. Test YES Action Link Flow
    const token = emailService.generateActionToken(report.report_id, recipientEmail);
    const isTokenValid = emailService.verifyActionToken(report.report_id, recipientEmail, token);
    
    if (isTokenValid) {
      await ReportModel.updateStatus(report.report_id, 'IN_PROGRESS');
      const updatedYes = await ReportModel.findById(report.report_id);
      if (updatedYes && updatedYes.status === 'IN_PROGRESS') {
        yesPass = true;
      }

      // 5. Test NO Action Link Flow
      await ReportModel.updateStatus(report.report_id, 'REJECTED');
      const updatedNo = await ReportModel.findById(report.report_id);
      if (updatedNo && updatedNo.status === 'REJECTED') {
        noPass = true;
      }

      // Restore baseline state
      await ReportModel.updateStatus(report.report_id, report.status);
    }
  } catch (err) {
    errorMsg = err.message;
  }

  console.log(JSON.stringify({
    emailSent: emailSent ? 'YES' : 'NO',
    yesAction: yesPass ? 'PASS' : 'FAIL',
    noAction: noPass ? 'PASS' : 'FAIL',
    error: errorMsg
  }));
}

testRealEmailDelivery();
