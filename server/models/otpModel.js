const crypto = require('crypto');
const emailService = require('../services/emailService');

// In-memory persistent OTP store (with TTL, attempt counting & cooldown)
const otpStore = new Map();
// In-memory short-lived verified status store (valid for 5 mins after OTP verified)
const verifiedStore = new Map();

// Periodic cleanup of expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of otpStore.entries()) {
    if (now > record.expiresAt) {
      otpStore.delete(key);
    }
  }
  for (const [key, record] of verifiedStore.entries()) {
    if (now > record.expiresAt) {
      verifiedStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

class OtpModel {
  static getStoreKey(email, role) {
    return `${email.trim().toLowerCase()}:${role.toUpperCase()}`;
  }

  static canSend(email, role) {
    const key = this.getStoreKey(email, role);
    const existing = otpStore.get(key);
    if (!existing) return { allowed: true };

    const now = Date.now();
    const cooldownMs = 60 * 1000; // 60 seconds resend cooldown
    const elapsed = now - existing.lastSentAt;

    if (elapsed < cooldownMs) {
      const waitSeconds = Math.ceil((cooldownMs - elapsed) / 1000);
      return {
        allowed: false,
        waitSeconds,
        message: `Please wait ${waitSeconds} seconds before requesting a new verification code.`
      };
    }

    return { allowed: true };
  }

  static saveOtp({ email, otp, role }) {
    const key = this.getStoreKey(email, role);
    const otpHash = emailService.constructor.hashOtp(otp);
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes expiration

    // Clear any prior verified status when a new OTP is requested
    verifiedStore.delete(key);

    const record = {
      email: email.trim().toLowerCase(),
      role: role.toUpperCase(),
      otpHash,
      attempts: 0,
      maxAttempts: 5,
      createdAt: now,
      lastSentAt: now,
      expiresAt,
      isVerified: false
    };

    otpStore.set(key, record);
    return record;
  }

  static verifyOtp({ email, inputOtp, role }) {
    const key = this.getStoreKey(email, role);
    const record = otpStore.get(key);

    if (!record) {
      // Check if already verified within grace period
      const verifiedRecord = verifiedStore.get(key);
      if (verifiedRecord && Date.now() <= verifiedRecord.expiresAt) {
        return {
          success: true,
          message: 'Verification successful.'
        };
      }

      return {
        success: false,
        reason: 'NOT_FOUND',
        message: 'No verification code requested for this email. Please click Send Verification Code.'
      };
    }

    const now = Date.now();
    if (now > record.expiresAt) {
      otpStore.delete(key);
      return {
        success: false,
        reason: 'EXPIRED',
        message: 'Verification code expired. Please request a new code.'
      };
    }

    if (record.attempts >= record.maxAttempts) {
      otpStore.delete(key);
      return {
        success: false,
        reason: 'TOO_MANY_ATTEMPTS',
        message: 'Too many attempts. Please request a new code.'
      };
    }

    const inputHash = emailService.constructor.hashOtp(inputOtp);
    if (inputHash !== record.otpHash) {
      record.attempts += 1;
      const remaining = record.maxAttempts - record.attempts;
      return {
        success: false,
        reason: 'INVALID',
        attempts: record.attempts,
        remainingAttempts: remaining,
        message: 'Invalid verification code.'
      };
    }

    // OTP verified successfully -> invalidate from active OTP store to prevent replay
    otpStore.delete(key);

    // Save into verifiedStore for a 5-minute single-use consumption window
    verifiedStore.set(key, {
      email: email.trim().toLowerCase(),
      role: role.toUpperCase(),
      verifiedAt: now,
      expiresAt: now + 5 * 60 * 1000
    });

    return {
      success: true,
      message: 'Verification successful.'
    };
  }

  /**
   * Check and consume verified status for login/registration
   * Returns true if status was verified and consumes it immediately (prevent replay)
   */
  static consumeVerifiedStatus(email, role) {
    const key = this.getStoreKey(email, role);
    const record = verifiedStore.get(key);
    if (!record) return false;

    const now = Date.now();
    if (now > record.expiresAt) {
      verifiedStore.delete(key);
      return false;
    }

    // Invalidate immediately upon consumption
    verifiedStore.delete(key);
    return true;
  }

  /**
   * Test helper to expire an OTP immediately (for automated test verification)
   */
  static expireOtpForTesting(email, role) {
    const key = this.getStoreKey(email, role);
    const record = otpStore.get(key);
    if (record) {
      record.expiresAt = Date.now() - 1000;
    }
    verifiedStore.delete(key);
  }

  /**
   * Test helper to clear store
   */
  static clearStoreForTesting() {
    otpStore.clear();
    verifiedStore.clear();
  }
}

module.exports = OtpModel;
