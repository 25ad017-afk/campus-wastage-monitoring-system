const pool = require('../config/db');

class NotificationModel {
  /**
   * Ensure notifications table exists in the database
   */
  static async initTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          notification_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
          recipient_id INT UNSIGNED NOT NULL,
          report_id INT UNSIGNED NULL,
          title VARCHAR(150) NOT NULL,
          message TEXT NOT NULL,
          notification_type VARCHAR(50) NOT NULL DEFAULT 'STATUS_UPDATE',
          is_read BOOLEAN NOT NULL DEFAULT FALSE,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_notif_user_unread (recipient_id, is_read)
        ) ENGINE=InnoDB;
      `);
    } catch (err) {
      console.error('Failed to initialize notifications table:', err.message);
    }
  }

  /**
   * Create a single notification for a specific user
   */
  static async create({ recipientId, reportId = null, title, message, type = 'STATUS_UPDATE' }) {
    try {
      const [result] = await pool.query(
        `INSERT INTO notifications (recipient_id, report_id, title, message, notification_type, is_read)
         VALUES (?, ?, ?, ?, ?, FALSE)`,
        [recipientId, reportId, title, message, type]
      );
      return result.insertId;
    } catch (err) {
      console.error('Error creating notification:', err.message);
      return null;
    }
  }

  /**
   * Helper to broadcast a notification to all active ADMIN users
   */
  static async createForAdmins({ reportId = null, title, message, type = 'STATUS_UPDATE' }) {
    try {
      const [admins] = await pool.query(
        `SELECT user_id FROM users WHERE role = 'ADMIN' AND is_active = TRUE`
      );

      if (!admins || admins.length === 0) return [];

      const values = admins.map(admin => [
        admin.user_id,
        reportId,
        title,
        message,
        type,
        false
      ]);

      const [result] = await pool.query(
        `INSERT INTO notifications (recipient_id, report_id, title, message, notification_type, is_read)
         VALUES ?`,
        [values]
      );
      return result.affectedRows;
    } catch (err) {
      console.error('Error creating admin notifications:', err.message);
      return 0;
    }
  }

  /**
   * Fetch recent notifications for a user
   */
  static async getByUser(userId, limit = 40) {
    const [rows] = await pool.query(
      `SELECT 
        n.notification_id,
        n.recipient_id,
        n.report_id,
        n.title,
        n.message,
        n.notification_type,
        n.is_read,
        n.created_at,
        r.ticket_code
       FROM notifications n
       LEFT JOIN waste_reports r ON n.report_id = r.report_id
       WHERE n.recipient_id = ?
       ORDER BY n.created_at DESC
       LIMIT ?`,
      [userId, limit]
    );
    return rows;
  }

  /**
   * Get total count of unread notifications for a user
   */
  static async getUnreadCount(userId) {
    const [rows] = await pool.query(
      `SELECT COUNT(*) AS unread_count 
       FROM notifications 
       WHERE recipient_id = ? AND is_read = FALSE`,
      [userId]
    );
    return rows[0]?.unread_count || 0;
  }

  /**
   * Mark a single notification as read
   */
  static async markAsRead(notificationId, userId) {
    const [result] = await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE notification_id = ? AND recipient_id = ?`,
      [notificationId, userId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    const [result] = await pool.query(
      `UPDATE notifications 
       SET is_read = TRUE 
       WHERE recipient_id = ? AND is_read = FALSE`,
      [userId]
    );
    return result.affectedRows;
  }
}

// Ensure table is ready on module load
NotificationModel.initTable();

module.exports = NotificationModel;
