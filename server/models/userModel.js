const pool = require('../config/db');

class UserModel {
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const normalized = email.trim().toLowerCase();
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, password_hash, role, phone_number, is_active, is_email_verified, created_at FROM users WHERE LOWER(email) = ? LIMIT 1',
      [normalized]
    );
    return rows[0] || null;
  }

  /**
   * Find user by user_id
   */
  static async findById(userId) {
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, role, phone_number, is_active, is_email_verified, created_at FROM users WHERE user_id = ? LIMIT 1',
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * Create a new user
   */
  static async create({ fullName, email, passwordHash, role = 'STUDENT', phoneNumber = null, isEmailVerified = true }) {
    const normalized = email.trim().toLowerCase();
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role, phone_number, is_email_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [fullName, normalized, passwordHash, role, phoneNumber, isEmailVerified ? 1 : 0]
    );
    return result.insertId;
  }

  /**
   * Mark user's email as verified
   */
  static async markEmailVerified(userId) {
    const [result] = await pool.query(
      'UPDATE users SET is_email_verified = 1 WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Check if an email belongs to authorized staff
   */
  static async isStaffAuthorized(email) {
    const normalized = email.trim().toLowerCase();
    const [rows] = await pool.query(
      'SELECT u.user_id, u.email, u.role, s.staff_id, s.is_available, s.assigned_zone FROM users u LEFT JOIN cleaning_staff s ON u.user_id = s.user_id WHERE LOWER(u.email) = ? AND u.role IN ("STAFF", "ADMIN") LIMIT 1',
      [normalized]
    );
    return rows[0] || null;
  }

  /**
   * Get all users filtered by role
   */
  static async getByRole(role) {
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, role, phone_number, is_active, is_email_verified, created_at FROM users WHERE role = ? AND is_active = TRUE ORDER BY full_name ASC',
      [role]
    );
    return rows;
  }
}

module.exports = UserModel;
