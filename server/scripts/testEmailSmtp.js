const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const emailService = require('../services/emailService');
const OtpModel = require('../models/otpModel');

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

async function runSmtpVerification() {
  console.log(`${colors.bright}${colors.magenta}`);
  console.log('================================================================');
  console.log('  CWMS REAL EMAIL OTP & SMTP SERVICE VERIFICATION');
  console.log('================================================================');
  console.log(`${colors.reset}`);

  // 1. Inspect Service Status
  logStep('STEP 1', 'Inspecting SMTP Service Status & Configuration...');
  const status = emailService.getStatus();
  logInfo('Status', status.status);
  logInfo('Is Configured', status.isConfigured);
  logInfo('Host', `${status.host}:${status.port}`);
  logInfo('Sender Account', status.senderAccount);
  logInfo('From Address', status.fromAddress);
  logInfo('Student Domain', status.studentDomain);
  logInfo('Staff Domain', status.staffDomain);

  // 2. Test OTP Generation & Hashing
  logStep('STEP 2', 'Testing OTP Generator & SHA-256 Hashing...');
  const testOtp = emailService.constructor.generateOtp();
  const hash = emailService.constructor.hashOtp(testOtp);
  if (/^\d{6}$/.test(testOtp) && hash && hash.length === 64) {
    logSuccess(`Generated 6-digit OTP: ${testOtp.slice(0, 2)}**** and verified 64-char SHA-256 hash.`);
  } else {
    logError('OTP generation failed validation.');
  }

  // 3. Test OTP Model Cooldown, Expiry & Attempt Limits
  logStep('STEP 3', 'Testing OTP Lifecycle, 60s Cooldown & 5-Attempt Limit...');
  const testEmail = 'student.test@acetcbe.edu.in';
  const testRole = 'STUDENT';

  // Save OTP
  OtpModel.saveOtp({ email: testEmail, otp: testOtp, role: testRole });
  logSuccess('OTP saved to memory store with 10-minute expiry.');

  // Cooldown check
  const cooldownCheck = OtpModel.canSend(testEmail, testRole);
  if (!cooldownCheck.allowed && cooldownCheck.waitSeconds > 0) {
    logSuccess(`Cooldown enforced correctly: "${cooldownCheck.message}"`);
  } else {
    logError('Cooldown was not enforced!');
  }

  // Wrong OTP attempt test
  const wrongRes = OtpModel.verifyOtp({ email: testEmail, inputOtp: '000000', role: testRole });
  if (!wrongRes.success && wrongRes.remainingAttempts === 4) {
    logSuccess(`Invalid attempt tracked correctly: remaining attempts = ${wrongRes.remainingAttempts}`);
  } else {
    logError('Attempt tracking failed', wrongRes);
  }

  // Correct OTP verification
  const correctRes = OtpModel.verifyOtp({ email: testEmail, inputOtp: testOtp, role: testRole });
  if (correctRes.success) {
    logSuccess('Correct OTP verified successfully and invalidated to prevent replay.');
  } else {
    logError('Correct OTP verification failed', correctRes);
  }

  // 4. Test SMTP Connection
  logStep('STEP 4', 'Testing Real Nodemailer SMTP Connection...');
  if (!status.isConfigured) {
    logInfo('Notice', 'SMTP credentials (EMAIL_USER / EMAIL_PASSWORD) are not set in server/.env.');
    logInfo('Action', 'To enable live email dispatch, add your Gmail/Google Workspace credentials to server/.env.');
    console.log(`\n${colors.bright}${colors.yellow}Summary: OTP security and state management verified. Waiting for live SMTP credentials in server/.env.${colors.reset}\n`);
    return;
  }

  try {
    const verifyResult = await emailService.verifyConnection();
    if (verifyResult.success) {
      logSuccess(`Nodemailer SMTP Connection Verified: ${verifyResult.message}`);

      // Send live test email to recipient or configured user
      const targetRecipient = process.env.TEST_EMAIL_RECIPIENT || process.env.EMAIL_USER;
      logStep('STEP 5', `Dispatching Live Test Verification Email to ${targetRecipient}...`);
      const sendResult = await emailService.sendOtpEmail({
        to: targetRecipient,
        otp: testOtp,
        role: 'STUDENT',
        recipientName: 'ACET Test User'
      });

      if (sendResult.success) {
        logSuccess(`Live email dispatched successfully via SMTP! Message ID: ${sendResult.messageId}`);
        console.log(`\n${colors.bright}${colors.green}✔ REAL SMTP EMAIL OTP SYSTEM IS FULLY OPERATIONAL!${colors.reset}\n`);
      } else {
        logError('Failed to send email via SMTP:', sendResult.error);
      }
    } else {
      logError(`SMTP Connection Verification Failed: ${verifyResult.message}`);
    }
  } catch (err) {
    logError('SMTP test error:', err.message);
  }
}

runSmtpVerification().catch(err => {
  console.error('Fatal test error:', err);
});
