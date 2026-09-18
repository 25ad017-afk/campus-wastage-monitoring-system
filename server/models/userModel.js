const pool = require('../config/db');

class UserModel {
  /**
   * Find user by email
   */
  static async findByEmail(email) {
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, password_hash, role, phone_number, is_active, created_at FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Find user by user_id
   */
  static async findById(userId) {
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, role, phone_number, is_active, created_at FROM users WHERE user_id = ? LIMIT 1',
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * Create a new user
   */
  static async create({ fullName, email, passwordHash, role = 'STUDENT', phoneNumber = null }) {
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password_hash, role, phone_number) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, passwordHash, role, phoneNumber]
    );
    return result.insertId;
  }

  /**
   * Get all users filtered by role
   */
  static async getByRole(role) {
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, role, phone_number, is_active, created_at FROM users WHERE role = ? AND is_active = TRUE ORDER BY full_name ASC',
      [role]
    );
    return rows;
  }
}

module.exports = UserModel;
