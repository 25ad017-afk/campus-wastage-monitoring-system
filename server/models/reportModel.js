const pool = require('../config/db');

class ReportModel {
  /**
   * Create a new waste report
   */
  static async create({ ticketCode, reporterId, locationId, categoryId, description, priority = 'MEDIUM' }) {
    const [result] = await pool.query(
      `INSERT INTO waste_reports (ticket_code, reporter_id, location_id, category_id, description, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, 'REPORTED')`,
      [ticketCode, reporterId, locationId, categoryId, description, priority]
    );
    return result.insertId;
  }

  /**
   * Attach an image to a waste report (Before or After)
   */
  static async addImage({ reportId, uploadedBy, imageType, imageUrl, fileSizeKb = null }) {
    const [result] = await pool.query(
      `INSERT INTO before_after_images (report_id, uploaded_by, image_type, image_url, file_size_kb)
       VALUES (?, ?, ?, ?, ?)`,
      [reportId, uploadedBy, imageType, imageUrl, fileSizeKb]
    );
    return result.insertId;
  }

  /**
   * Get all images linked to a specific report
   */
  static async getImagesByReportId(reportId) {
    const [rows] = await pool.query(
      `SELECT image_id, image_type, image_url, file_size_kb, uploaded_at
       FROM before_after_images
       WHERE report_id = ?
       ORDER BY uploaded_at ASC`,
      [reportId]
    );
    return rows;
  }

  /**
   * Find report by ID with full details (reporter, location, category, and images)
   */
  static async findById(reportId) {
    const [reportRows] = await pool.query(
      `SELECT r.report_id, r.ticket_code, r.description, r.priority, r.status, r.created_at, r.updated_at,
              u.user_id AS reporter_id, u.full_name AS reporter_name, u.email AS reporter_email,
              l.location_id, l.zone_name, l.building_name, l.floor_or_landmark, l.latitude, l.longitude,
              c.category_id, c.category_name, c.color_code, c.is_hazardous
       FROM waste_reports r
       JOIN users u ON r.reporter_id = u.user_id
       JOIN locations l ON r.location_id = l.location_id
       JOIN waste_categories c ON r.category_id = c.category_id
       WHERE r.report_id = ? LIMIT 1`,
      [reportId]
    );

    if (reportRows.length === 0) return null;

    const report = reportRows[0];
    report.images = await this.getImagesByReportId(reportId);
    const beforeImg = report.images.find(img => img.image_type === 'BEFORE');
    const afterImg = report.images.find(img => img.image_type === 'AFTER');
    report.before_image = beforeImg ? beforeImg.image_url : null;
    report.after_image = afterImg ? afterImg.image_url : null;
    return report;
  }

  /**
   * Get reports submitted by a specific user (Student / Reporter)
   */
  static async getByReporter(reporterId) {
    const [rows] = await pool.query(
      `SELECT r.report_id, r.ticket_code, r.description, r.priority, r.status, r.created_at, r.updated_at,
              l.zone_name, l.building_name, l.floor_or_landmark,
              c.category_name, c.color_code,
              (SELECT image_url FROM before_after_images WHERE report_id = r.report_id AND image_type = 'BEFORE' LIMIT 1) AS before_image,
              (SELECT image_url FROM before_after_images WHERE report_id = r.report_id AND image_type = 'AFTER' LIMIT 1) AS after_image
       FROM waste_reports r
       JOIN locations l ON r.location_id = l.location_id
       JOIN waste_categories c ON r.category_id = c.category_id
       WHERE r.reporter_id = ?
       ORDER BY r.created_at DESC`,
      [reporterId]
    );
    return rows;
  }

  /**
   * Get all reports with optional filtering (for Admin / Staff)
   */
  static async getAll({ status, priority, zoneName }) {
    let sql = `
      SELECT r.report_id, r.ticket_code, r.description, r.priority, r.status, r.created_at, r.updated_at,
             u.full_name AS reporter_name, u.email AS reporter_email,
             l.zone_name, l.building_name, l.floor_or_landmark, l.latitude, l.longitude,
             c.category_name, c.color_code,
             (SELECT image_url FROM before_after_images WHERE report_id = r.report_id AND image_type = 'BEFORE' LIMIT 1) AS before_image,
             (SELECT image_url FROM before_after_images WHERE report_id = r.report_id AND image_type = 'AFTER' LIMIT 1) AS after_image
      FROM waste_reports r
      JOIN users u ON r.reporter_id = u.user_id
      JOIN locations l ON r.location_id = l.location_id
      JOIN waste_categories c ON r.category_id = c.category_id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      sql += ' AND r.status = ?';
      params.push(status);
    }
    if (priority) {
      sql += ' AND r.priority = ?';
      params.push(priority);
    }
    if (zoneName) {
      sql += ' AND l.zone_name = ?';
      params.push(zoneName);
    }

    sql += ' ORDER BY r.created_at DESC';

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  /**
   * Update report status
   */
  static async updateStatus(reportId, status) {
    const [result] = await pool.query(
      'UPDATE waste_reports SET status = ? WHERE report_id = ?',
      [status, reportId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Delete report by ID (Database foreign keys cascade before_after_images & assignments)
   */
  static async delete(reportId) {
    const [result] = await pool.query(
      'DELETE FROM waste_reports WHERE report_id = ?',
      [reportId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Check if location ID exists
   */
  static async validateLocation(locationId) {
    const [rows] = await pool.query(
      'SELECT location_id FROM locations WHERE location_id = ? LIMIT 1',
      [locationId]
    );
    return rows.length > 0;
  }

  /**
   * Check if category ID exists
   */
  static async validateCategory(categoryId) {
    const [rows] = await pool.query(
      'SELECT category_id FROM waste_categories WHERE category_id = ? LIMIT 1',
      [categoryId]
    );
    return rows.length > 0;
  }
}

module.exports = ReportModel;
