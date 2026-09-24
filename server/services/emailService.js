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
}

const emailService = new EmailService();
module.exports = emailService;
