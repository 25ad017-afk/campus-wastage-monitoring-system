/**
 * Verification test for CWMS Email Notification / Confirmation (YES / NO) System
 */
require('dotenv').config();
const emailService = require('../services/emailService');
const ReportModel = require('../models/reportModel');
const ReportController = require('../controllers/reportController');

async function runTests() {
  console.log('========================================================');
  console.log('🧪 RUNNING CWMS EMAIL ACTION CONFIRMATION (YES/NO) TESTS');
  console.log('========================================================\n');

  try {
    // 1. Test Token Generation & Verification
    console.log('--- Test 1: HMAC-SHA256 Token Security ---');
    const testReportId = 1;
    const testEmail = 'student@acetcbe.edu.in';
    const token = emailService.generateActionToken(testReportId, testEmail);
    console.log('Generated Action Token:', token);

    const isValid = emailService.verifyActionToken(testReportId, testEmail, token);
    console.log('Token Validation Result (Correct Email):', isValid ? '✅ PASSED' : '❌ FAILED');

    const isInvalid = emailService.verifyActionToken(testReportId, 'attacker@evil.com', token);
    console.log('Token Validation Result (Wrong Email):', !isInvalid ? '✅ SECURE (Rejected)' : '❌ INSECURE');

    // 2. Test Email Action Template Generation
    console.log('\n--- Test 2: Email Template Content Verification ---');
    const mockReport = {
      report_id: 1,
      ticket_code: 'CWMS-2026-99001',
      building_name: 'Main Academic Block - Floor 2',
      priority: 'HIGH',
      description: 'Accumulated plastic bottles near water cooler.',
      reporter_name: 'Mathan Kumar'
    };

    const emailHtml = emailService.generateActionConfirmationTemplate({
      recipientName: 'Facilities Coordinator',
      report: mockReport,
      yesUrl: 'https://campus-wastage-monitoring-system.vercel.app/api/reports/1/action-confirm?action=YES&token=mock&email=test',
      noUrl: 'https://campus-wastage-monitoring-system.vercel.app/api/reports/1/action-confirm?action=NO&token=mock&email=test'
    });

    const hasCwmsTitle = emailHtml.includes('Campus Waste Monitoring System');
    const hasRequiredMsg = emailHtml.includes('A new waste management request/action requires your confirmation.');
    const hasYesButton = emailHtml.includes('YES') && emailHtml.includes('action=YES');
    const hasNoButton = emailHtml.includes('NO') && emailHtml.includes('action=NO');

    console.log('Contains "Campus Waste Monitoring System":', hasCwmsTitle ? '✅ PASSED' : '❌ FAILED');
    console.log('Contains "A new waste management request/action requires your confirmation.":', hasRequiredMsg ? '✅ PASSED' : '❌ FAILED');
    console.log('Contains functional YES button/link:', hasYesButton ? '✅ PASSED' : '❌ FAILED');
    console.log('Contains functional NO button/link:', hasNoButton ? '✅ PASSED' : '❌ FAILED');

    // 3. Test Controller YES/NO Endpoints with Mock HTTP Request
    console.log('\n--- Test 3: YES Action Execution & DB Status Update ---');
    const activeReport = await ReportModel.findById(1);
    if (activeReport) {
      const originalStatus = activeReport.status;
      const targetEmail = activeReport.reporter_email || 'priya.student@acetcbe.edu.in';
      const validToken = emailService.generateActionToken(activeReport.report_id, targetEmail);

      // Simulate YES action
      let mockResStatus = null;
      let mockResData = null;

      const mockReqYes = {
        params: { id: activeReport.report_id },
        query: { action: 'YES', token: validToken, email: targetEmail },
        body: {},
        headers: { accept: 'application/json' }
      };

      const mockResYes = {
        status: (code) => {
          mockResStatus = code;
          return {
            json: (data) => { mockResData = data; return data; },
            send: (html) => { mockResData = html; return html; }
          };
        }
      };

      await ReportController.handleActionConfirmation(mockReqYes, mockResYes, (err) => {
        if (err) console.error('YES handler error:', err);
      });

      console.log('YES Action HTTP Status:', mockResStatus);
      console.log('YES Action Success:', mockResData?.success ? '✅ PASSED' : '❌ FAILED');
      console.log('Updated Status in Response:', mockResData?.data?.status);

      // Verify in DB directly via ReportModel
      const updatedAfterYes = await ReportModel.findById(activeReport.report_id);
      console.log('Database Status Check after YES:', updatedAfterYes?.status === 'IN_PROGRESS' ? '✅ IN_PROGRESS in DB' : updatedAfterYes?.status);

      // Simulate NO action
      console.log('\n--- Test 4: NO Action Execution & DB Status Update ---');
      const mockReqNo = {
        params: { id: activeReport.report_id },
        query: { action: 'NO', token: validToken, email: targetEmail },
        body: {},
        headers: { accept: 'application/json' }
      };

      const mockResNo = {
        status: (code) => {
          mockResStatus = code;
          return {
            json: (data) => { mockResData = data; return data; },
            send: (html) => { mockResData = html; return html; }
          };
        }
      };

      await ReportController.handleActionConfirmation(mockReqNo, mockResNo, (err) => {
        if (err) console.error('NO handler error:', err);
      });

      console.log('NO Action HTTP Status:', mockResStatus);
      console.log('NO Action Success:', mockResData?.success ? '✅ PASSED' : '❌ FAILED');
      console.log('Updated Status in Response:', mockResData?.data?.status);

      const updatedAfterNo = await ReportModel.findById(activeReport.report_id);
      console.log('Database Status Check after NO:', updatedAfterNo?.status === 'REJECTED' ? '✅ REJECTED in DB' : updatedAfterNo?.status);

      // Test HTML Render for browser email link click
      console.log('\n--- Test 5: Browser HTML Confirmation Page Render ---');
      let renderedHtml = null;
      const mockReqHtml = {
        params: { id: activeReport.report_id },
        query: { action: 'YES', token: validToken, email: targetEmail },
        body: {},
        headers: { accept: 'text/html' }
      };
      const mockResHtml = {
        status: (code) => ({
          send: (html) => { renderedHtml = html; return html; }
        })
      };

      await ReportController.handleActionConfirmation(mockReqHtml, mockResHtml, (err) => {
        if (err) console.error('HTML handler error:', err);
      });

      const hasHtmlTitle = renderedHtml.includes('Campus Waste Monitoring System');
      const hasActionConfirmed = renderedHtml.includes('Action Confirmed');
      const hasTicketInHtml = renderedHtml.includes(activeReport.ticket_code);
      console.log('HTML contains CWMS title:', hasHtmlTitle ? '✅ PASSED' : '❌ FAILED');
      console.log('HTML contains Action Confirmed badge:', hasActionConfirmed ? '✅ PASSED' : '❌ FAILED');
      console.log('HTML contains Report Ticket Code:', hasTicketInHtml ? '✅ PASSED' : '❌ FAILED');

      // Restore status to original
      await ReportModel.updateStatus(activeReport.report_id, originalStatus);
      console.log('\nCleaned up report status back to original:', originalStatus);
    } else {
      console.log('No report found with ID 1.');
    }

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
}

runTests();
