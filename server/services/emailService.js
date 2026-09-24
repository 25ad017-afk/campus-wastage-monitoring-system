let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (err) {
  // Graceful fallback if nodemailer is not resolved
}

const crypto = require('crypto');

/**
 * Helper to check if an environment string is an unfilled placeholder
 */
const isPlaceholder = (val) => {
  if (!val || typeof val !== 'string') return true;
  const v = val.trim().toLowerCase();
  const knownPlaceholders = [
    '',
    'your-authorized-email',
    'your-app-password',
    'your_email_app_password',
    'your_college_email@acetcbe.edu.in',
    'your_actual_email@gmail.com',
    'abcdefghijklmnop'
  ];
  return knownPlaceholders.includes(v);
};

/**
 * Transactional Email Service for Campus Wastage Monitoring System (CWMS)
 * Akshaya College of Engineering and Technology (ACET), Pollachi, Tamil Nadu
 */
class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initTransporter();
  }

  /**
   * Initialize or Reload Nodemailer SMTP Transport
   */
  initTransporter() {
    const host = (process.env.EMAIL_HOST || 'smtp.gmail.com').trim();
    const defaultPort = (host === 'smtp.gmail.com') ? 465 : 587;
    const port = parseInt(process.env.EMAIL_PORT || defaultPort, 10);
    const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim().replace(/^["']|["']$/g, '') : '';
    // Clean App Password (strip internal spaces and surrounding quotes often present when copied from Google)
    const pass = process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.trim().replace(/^["']|["']$/g, '').replace(/\s+/g, '') : '';
    const secure = process.env.EMAIL_SECURE !== undefined
      ? (process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_SECURE === '1')
      : (port === 465 || host === 'smtp.gmail.com');

    if (isPlaceholder(user) || isPlaceholder(pass)) {
      this.transporter = null;
      this.isConfigured = false;
      return;
    }

    if (!nodemailer) {
      this.transporter = null;
      this.isConfigured = false;
      console.warn('⚠️ SMTP Email Service: Nodemailer module not loaded.');
      return;
    }

    try {
      const transportOptions = {
        host,
        port,
        secure,
        auth: {
          user,
          pass
        },
        tls: {
          rejectUnauthorized: false
        }
      };

      this.transporter = nodemailer.createTransport(transportOptions);
      this.isConfigured = true;
      console.log(`✅ SMTP Email Service: Transporter initialized for ${user} via ${host}:${port} (SSL: ${secure})`);
    } catch (err) {
      console.warn('⚠️ SMTP Email Service initialization warning:', err.message);
      this.transporter = null;
      this.isConfigured = false;
    }
  }

  /**
   * Verify SMTP connection status
   */
  async verifyConnection() {
    this.initTransporter();
    if (!this.isConfigured || !this.transporter) {
      return {
        success: false,
        message: 'SMTP credentials are not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your environment variables.'
      };
    }

    try {
      await this.transporter.verify();
      return {
        success: true,
        message: 'SMTP server connection and credentials verified successfully.'
      };
    } catch (err) {
      return {
        success: false,
        message: `SMTP connection failed: ${err.message}`
      };
    }
  }

  /**
   * Status inspection (safe for API response, never leaks passwords)
   */
  getStatus() {
    this.initTransporter();
    const user = process.env.EMAIL_USER ? process.env.EMAIL_USER.trim().replace(/^["']|["']$/g, '') : '';
    const pass = process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.trim().replace(/^["']|["']$/g, '') : '';
    const host = (process.env.EMAIL_HOST || 'smtp.gmail.com').trim();
    const defaultPort = (host === 'smtp.gmail.com') ? 465 : 587;
    const port = parseInt(process.env.EMAIL_PORT || defaultPort, 10);
    const from = (process.env.EMAIL_FROM || user || '').trim();
    const secure = process.env.EMAIL_SECURE !== undefined
      ? (process.env.EMAIL_SECURE === 'true' || process.env.EMAIL_SECURE === '1')
      : (port === 465 || host === 'smtp.gmail.com');

    const configured = Boolean(!isPlaceholder(user) && !isPlaceholder(pass) && this.transporter);

    let maskedUser = 'Not configured';
    if (!isPlaceholder(user)) {
      const parts = user.split('@');
      if (parts.length === 2) {
        const namePart = parts[0];
        const maskedName = namePart.length > 3 ? namePart.slice(0, 2) + '***' + namePart.slice(-1) : namePart[0] + '***';
        maskedUser = `${maskedName}@${parts[1]}`;
      } else {
        maskedUser = `${user.slice(0, 2)}***`;
      }
    }

    return {
      status: configured ? 'Configured' : 'Not Configured',
      isConfigured: configured,
      host,
      port,
      secure,
      senderAccount: configured ? maskedUser : 'Not configured',
      fromAddress: from ? (from.includes('@') ? from.replace(/^(.)(.*)(@.*)$/, '$1***$3') : from) : 'Not configured',
      studentDomain: process.env.STUDENT_EMAIL_DOMAIN || '@acetcbe.edu.in',
      staffDomain: process.env.STAFF_EMAIL_DOMAIN || '@acetcbe.edu.in'
    };
  }

  static generateOtp() {
    return crypto.randomInt(100000, 999999).toString();
  }

  static hashOtp(otp) {
    return crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
  }

  /**
   * Send OTP Verification Email via Nodemailer
   */
  async sendOtpEmail({ to, otp, role = 'STUDENT', recipientName = 'Campus Member' }) {
    this.initTransporter();

    if (!this.isConfigured || !this.transporter) {
      return {
        success: false,
        error: 'SMTP Email Service is not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your environment variables.',
        mode: 'unconfigured'
      };
    }

    const rawFrom = (process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim()) ||
                    (process.env.EMAIL_USER && process.env.EMAIL_USER.trim()) ||
                    'cwms-security@acetcbe.edu.in';

    const collegeName = 'Akshaya College of Engineering and Technology';
    const collegeLocation = 'Kinathukadavu, Coimbatore / Pollachi Highway, Tamil Nadu';
    const roleLabel = role === 'STAFF' ? 'Staff / Faculty' : 'Student';
    const subject = 'CWMS Email Verification Code';

    const textContent = `Akshaya College of Engineering and Technology
Campus Wastage Monitoring System (CWMS)

Your verification code is: ${otp}

This code expires in 10 minutes.
If you did not request this verification code, please ignore this email.

${collegeName} - ${collegeLocation}`.trim();

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CWMS Email Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          <tr>
            <td style="background: linear-gradient(135deg, #064e3b 0%, #047857 100%); padding: 24px 20px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 19px; font-weight: 700; letter-spacing: 0.5px;">
                ${collegeName}
              </h1>
              <p style="color: #a7f3d0; margin: 5px 0 0 0; font-size: 12px; font-weight: 500;">
                Campus Wastage Monitoring &amp; Management System (CWMS)
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 24px; color: #334155;">
              <div style="display: inline-block; background-color: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; text-transform: uppercase; margin-bottom: 15px;">
                ${roleLabel} Verification
              </div>
              <h2 style="color: #0f172a; margin: 0 0 10px 0; font-size: 18px; font-weight: 700;">
                Email Verification Code
              </h2>
              <p style="margin: 0 0 18px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Hello ${recipientName || 'Campus Member'},<br/>
                Use the 6-digit verification code below to complete your authentication on the Campus Wastage Monitoring System:
              </p>
              <div style="background-color: #f8fafc; border: 2px dashed #059669; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
                <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #065f46; font-family: monospace; display: inline-block; padding-left: 8px;">
                  ${otp}
                </span>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b; font-weight: 600;">
                  ⏰ This code expires in 10 minutes (Single use).
                </p>
              </div>
              <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">
                If you did not request this verification code, please ignore this email. Do not share this code with anyone.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f8fafc; padding: 14px 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              <p style="margin: 0 0 3px 0;">${collegeName} &bull; ${collegeLocation}</p>
              <p style="margin: 0;">Automated CWMS Security Dispatch</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const fromHeader = rawFrom.includes('<') ? rawFrom : `"${collegeName} CWMS" <${rawFrom}>`;

    try {
      const info = await this.transporter.sendMail({
        from: fromHeader,
        to,
        subject,
        text: textContent,
        html: htmlContent
      });

      console.log(`📧 Verification email successfully sent to ${to} (Message ID: ${info.messageId})`);
      return { success: true, mode: 'smtp', messageId: info.messageId };
    } catch (err) {
      console.error(`❌ SMTP send error for ${to}:`, err.message);
      return {
        success: false,
        error: `SMTP dispatch failed: ${err.message}`,
        mode: 'smtp_failed'
      };
    }
  }

  /**
   * Generate HMAC-SHA256 Token for Email Action Confirmation
   */
  generateActionToken(reportId, email) {
    const secret = process.env.JWT_SECRET || 'cwms_action_token_secret_2026';
    const cleanEmail = (email || '').toLowerCase().trim();
    return crypto.createHmac('sha256', secret)
      .update(`${reportId}:CONFIRM:${cleanEmail}`)
      .digest('hex');
  }

  /**
   * Verify HMAC-SHA256 Token for Email Action Confirmation
   */
  verifyActionToken(reportId, email, token) {
    if (!token || typeof token !== 'string') return false;
    const expected = this.generateActionToken(reportId, email);
    try {
      return crypto.timingSafeEqual(Buffer.from(token, 'hex'), Buffer.from(expected, 'hex'));
    } catch (e) {
      return token.toLowerCase() === expected.toLowerCase();
    }
  }

  /**
   * Generate Action Confirmation Email HTML & Plaintext Templates
   */
  generateActionConfirmationTemplate({
    recipientName = 'Campus Member',
    report,
    yesUrl,
    noUrl
  }) {
    const collegeName = 'Akshaya College of Engineering and Technology';
    const collegeLocation = 'Kinathukadavu, Coimbatore / Pollachi Highway, Tamil Nadu';
    const reportId = report.report_id || report.id;
    const ticketCode = report.ticket_code || `CWMS-${reportId}`;
    const buildingName = report.building_name || 'Campus Academic / Facility Zone';
    const landmark = report.floor_or_landmark || 'General Campus Area';
    const categoryName = report.category_name || 'General Waste';
    const priority = report.priority || 'MEDIUM';
    const description = report.description || 'Waste cleanup and disposal confirmation required.';
    const priorityBadgeColor = priority === 'CRITICAL' ? '#ef4444' : priority === 'HIGH' ? '#f97316' : '#059669';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Campus Waste Monitoring System - Action Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0284c7 100%); padding: 26px 22px; text-align: center;">
              <div style="background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 20px; display: inline-block; padding: 4px 14px; margin-bottom: 8px;">
                <span style="color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                  🏛️ ${collegeName}
                </span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">
                Campus Waste Monitoring System
              </h1>
              <p style="color: #a7f3d0; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">
                Official Action Verification &amp; Task Dispatch
              </p>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 30px 24px; color: #334155;">
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #1e293b; font-weight: 600;">
                Hello ${recipientName || 'Campus Member'},
              </p>

              <!-- Required Message Banner -->
              <div style="background: #f0fdf4; border-left: 4px solid #059669; border-radius: 8px; padding: 14px 16px; margin-bottom: 22px;">
                <p style="margin: 0; font-size: 15px; font-weight: 700; color: #065f46; line-height: 1.4;">
                  A new waste management request/action requires your confirmation.
                </p>
              </div>

              <!-- Request Details Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 26px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 35%;">Ticket Code:</td>
                    <td style="padding: 4px 0; font-size: 14px; color: #0f172a; font-weight: 800; font-family: monospace;">#${ticketCode}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #64748b; font-weight: 600;">Location:</td>
                    <td style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 600;">${buildingName} &bull; ${landmark}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #64748b; font-weight: 600;">Waste Category:</td>
                    <td style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 600;">${categoryName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #64748b; font-weight: 600;">Urgency Priority:</td>
                    <td style="padding: 4px 0; font-size: 13px;">
                      <span style="display: inline-block; background: ${priorityBadgeColor}; color: #ffffff; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700;">
                        ${priority} PRIORITY
                      </span>
                    </td>
                  </tr>
                  ${description ? `
                  <tr>
                    <td style="padding: 6px 0 0 0; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Description:</td>
                    <td style="padding: 6px 0 0 0; font-size: 13px; color: #334155; line-height: 1.4;">${description}</td>
                  </tr>` : ''}
                </table>
              </div>

              <!-- Interactive YES / NO Action Callout -->
              <div style="text-align: center; margin: 25px 0 15px 0;">
                <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em;">
                  Please review and click your response below:
                </p>

                <!-- Action Buttons: YES and NO -->
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                  <tr>
                    <!-- YES Button -->
                    <td style="padding-right: 12px;">
                      <a href="${yesUrl}" target="_blank" style="background-color: #059669; color: #ffffff; display: inline-block; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); letter-spacing: 0.04em;">
                        YES
                      </a>
                    </td>

                    <!-- NO Button -->
                    <td style="padding-left: 12px;">
                      <a href="${noUrl}" target="_blank" style="background-color: #dc2626; color: #ffffff; display: inline-block; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); letter-spacing: 0.04em;">
                        NO
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 22px 0 0 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.4;">
                Clicking YES or NO from this email will automatically update the request status in the database and notify the team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              <p style="margin: 0 0 3px 0; font-weight: 600; color: #64748b;">
                ${collegeName} &bull; ${collegeLocation}
              </p>
              <p style="margin: 0;">Automated Campus Waste Monitoring System Dispatch</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    return htmlContent;
  }

  /**
   * Send Waste Management Request / Action Confirmation Email with functional YES and NO action links
   */
  async sendActionConfirmationEmail({
    to,
    recipientName = 'Campus Member',
    report,
    actionType = 'WASTE_REQUEST_CONFIRMATION',
    baseUrl = 'https://campus-wastage-monitoring-system.vercel.app'
  }) {
    this.initTransporter();

    if (!this.isConfigured || !this.transporter) {
      return {
        success: false,
        error: 'SMTP Email Service is not configured. Please set EMAIL_USER and EMAIL_PASSWORD in your environment variables.',
        mode: 'unconfigured'
      };
    }

    const reportId = report.report_id || report.id;
    const ticketCode = report.ticket_code || `CWMS-${reportId}`;
    const buildingName = report.building_name || 'Campus Academic / Facility Zone';
    const landmark = report.floor_or_landmark || 'General Campus Area';
    const categoryName = report.category_name || 'General Waste';
    const priority = report.priority || 'MEDIUM';
    const description = report.description || 'Waste cleanup and disposal confirmation required.';
    const reporterName = report.reporter_name || 'Campus Student';

    const secret = process.env.JWT_SECRET || 'cwms_action_token_secret_2026';
    const cleanEmail = (to || '').toLowerCase().trim();

    // Generate secure action tokens
    const token = crypto.createHmac('sha256', secret)
      .update(`${reportId}:CONFIRM:${cleanEmail}`)
      .digest('hex');

    const cleanBaseUrl = (baseUrl || 'https://campus-wastage-monitoring-system.vercel.app').replace(/\/$/, '');
    const yesUrl = `${cleanBaseUrl}/api/reports/${reportId}/action-confirm?action=YES&token=${token}&email=${encodeURIComponent(cleanEmail)}`;
    const noUrl = `${cleanBaseUrl}/api/reports/${reportId}/action-confirm?action=NO&token=${token}&email=${encodeURIComponent(cleanEmail)}`;

    const collegeName = 'Akshaya College of Engineering and Technology';
    const collegeLocation = 'Kinathukadavu, Coimbatore / Pollachi Highway, Tamil Nadu';
    const rawFrom = (process.env.EMAIL_FROM && process.env.EMAIL_FROM.trim()) ||
                    (process.env.EMAIL_USER && process.env.EMAIL_USER.trim()) ||
                    'cwms-notifications@acetcbe.edu.in';

    const subject = `Campus Waste Monitoring System - Action Required for #${ticketCode}`;

    const textContent = `Campus Waste Monitoring System
${collegeName}

Hello ${recipientName},

A new waste management request/action requires your confirmation.

REQUEST DETAILS:
- Ticket Code: #${ticketCode}
- Location: ${buildingName} (${landmark})
- Waste Category: ${categoryName}
- Priority: ${priority}
- Description: ${description}

PLEASE CONFIRM YOUR ACTION:

[ YES - Confirm & Accept Request ]
Link: ${yesUrl}

[ NO - Decline / Cancel Request ]
Link: ${noUrl}

Thank you,
${collegeName} - Campus Waste Monitoring System (CWMS)`.trim();

    const priorityBadgeColor = priority === 'CRITICAL' ? '#ef4444' : priority === 'HIGH' ? '#f97316' : '#059669';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Campus Waste Monitoring System - Action Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #0284c7 100%); padding: 26px 22px; text-align: center;">
              <div style="background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); border-radius: 20px; display: inline-block; padding: 4px 14px; margin-bottom: 8px;">
                <span style="color: #ffffff; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
                  🏛️ ${collegeName}
                </span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">
                Campus Waste Monitoring System
              </h1>
              <p style="color: #a7f3d0; margin: 6px 0 0 0; font-size: 13px; font-weight: 500;">
                Official Action Verification &amp; Task Dispatch
              </p>
            </td>
          </tr>

          <!-- Main Content Body -->
          <tr>
            <td style="padding: 30px 24px; color: #334155;">
              <p style="margin: 0 0 16px 0; font-size: 15px; color: #1e293b; font-weight: 600;">
                Hello ${recipientName || 'Campus Member'},
              </p>

              <!-- Required Message Banner -->
              <div style="background: #f0fdf4; border-left: 4px solid #059669; border-radius: 8px; padding: 14px 16px; margin-bottom: 22px;">
                <p style="margin: 0; font-size: 15px; font-weight: 700; color: #065f46; line-height: 1.4;">
                  A new waste management request/action requires your confirmation.
                </p>
              </div>

              <!-- Request Details Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px 20px; margin-bottom: 26px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 35%;">Ticket Code:</td>
                    <td style="padding: 4px 0; font-size: 14px; color: #0f172a; font-weight: 800; font-family: monospace;">#${ticketCode}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #64748b; font-weight: 600;">Location:</td>
                    <td style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 600;">${buildingName} &bull; ${landmark}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #64748b; font-weight: 600;">Waste Category:</td>
                    <td style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 600;">${categoryName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 4px 0; font-size: 13px; color: #64748b; font-weight: 600;">Urgency Priority:</td>
                    <td style="padding: 4px 0; font-size: 13px;">
                      <span style="display: inline-block; background: ${priorityBadgeColor}; color: #ffffff; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 700;">
                        ${priority} PRIORITY
                      </span>
                    </td>
                  </tr>
                  ${description ? `
                  <tr>
                    <td style="padding: 6px 0 0 0; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Description:</td>
                    <td style="padding: 6px 0 0 0; font-size: 13px; color: #334155; line-height: 1.4;">${description}</td>
                  </tr>` : ''}
                </table>
              </div>

              <!-- Interactive YES / NO Action Callout -->
              <div style="text-align: center; margin: 25px 0 15px 0;">
                <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #0f172a; letter-spacing: -0.01em;">
                  Please review and click your response below:
                </p>

                <!-- Action Buttons: YES and NO -->
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                  <tr>
                    <!-- YES Button -->
                    <td style="padding-right: 12px;">
                      <a href="${yesUrl}" target="_blank" style="background-color: #059669; color: #ffffff; display: inline-block; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3); letter-spacing: 0.04em;">
                        YES
                      </a>
                    </td>

                    <!-- NO Button -->
                    <td style="padding-left: 12px;">
                      <a href="${noUrl}" target="_blank" style="background-color: #dc2626; color: #ffffff; display: inline-block; font-size: 14px; font-weight: 700; text-decoration: none; padding: 13px 28px; border-radius: 8px; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3); letter-spacing: 0.04em;">
                        NO
                      </a>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="margin: 22px 0 0 0; font-size: 12px; color: #94a3b8; text-align: center; line-height: 1.4;">
                Clicking YES or NO from this email will automatically update the request status in the database and notify the team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 16px 20px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
              <p style="margin: 0 0 3px 0; font-weight: 600; color: #64748b;">
                ${collegeName} &bull; ${collegeLocation}
              </p>
              <p style="margin: 0;">Automated Campus Waste Monitoring System Dispatch</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const fromHeader = rawFrom.includes('<') ? rawFrom : `"${collegeName} CWMS" <${rawFrom}>`;

    try {
      const info = await this.transporter.sendMail({
        from: fromHeader,
        to,
        subject,
        text: textContent,
        html: htmlContent
      });

      console.log(`📧 Action confirmation email sent to ${to} for ticket #${ticketCode} (ID: ${info.messageId})`);
      return { success: true, mode: 'smtp', messageId: info.messageId, yesUrl, noUrl };
    } catch (err) {
      console.error(`❌ SMTP action email failed for ${to}:`, err.message);
      return {
        success: false,
        error: `SMTP dispatch failed: ${err.message}`,
        mode: 'smtp_failed',
        yesUrl,
        noUrl
      };
    }
  }
}

const emailService = new EmailService();
module.exports = emailService;

