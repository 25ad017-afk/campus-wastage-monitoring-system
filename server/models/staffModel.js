const pool = require('../config/db');

class StaffModel {
  /**
   * Find cleaning staff profile by user_id
   */
  static async findByUserId(userId) {
    const [rows] = await pool.query(
      `SELECT s.staff_id, s.user_id, s.employee_code, s.assigned_zone, s.shift_timing, s.is_available,
              u.full_name, u.email, u.phone_number
       FROM cleaning_staff s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.user_id = ? LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  }

  /**
   * Find staff profile by staff_id
   */
  static async findById(staffId) {
    const [rows] = await pool.query(
      `SELECT s.staff_id, s.user_id, s.employee_code, s.assigned_zone, s.shift_timing, s.is_available,
              u.full_name, u.email, u.phone_number
       FROM cleaning_staff s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.staff_id = ? LIMIT 1`,
      [staffId]
    );
    return rows[0] || null;
  }

  /**
   * Create cleaning staff profile
   */
  static async create({ userId, employeeCode, assignedZone = null, shiftTiming = 'MORNING' }) {
    const [result] = await pool.query(
      'INSERT INTO cleaning_staff (user_id, employee_code, assigned_zone, shift_timing) VALUES (?, ?, ?, ?)',
      [userId, employeeCode, assignedZone, shiftTiming]
    );
    return result.insertId;
  }

  /**
   * Get all cleaning staff members with user details
   */
  static async getAllStaff() {
    const [rows] = await pool.query(
      `SELECT s.staff_id, s.user_id, s.employee_code, s.assigned_zone, s.shift_timing, s.is_available,
              u.full_name, u.email, u.phone_number
       FROM cleaning_staff s
       JOIN users u ON s.user_id = u.user_id
       WHERE u.is_active = TRUE
       ORDER BY u.full_name ASC`
    );
    return rows;
  }

  /**
   * Update staff availability status
   */
  static async updateAvailability(staffId, isAvailable) {
    const [result] = await pool.query(
      'UPDATE cleaning_staff SET is_available = ? WHERE staff_id = ?',
      [isAvailable, staffId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = StaffModel;
