const pool = require('../config/db');

class AssignmentModel {
  /**
   * Create an assignment linking a report to a staff member (Used by Admin)
   */
  static async create({ reportId, staffId, assignedBy, adminNotes = null }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Insert assignment record
      const [assignResult] = await connection.query(
        `INSERT INTO assignments (report_id, staff_id, assigned_by, admin_notes, assignment_status)
         VALUES (?, ?, ?, ?, 'ASSIGNED')`,
        [reportId, staffId, assignedBy, adminNotes]
      );

      // 2. Update waste_report status to 'ASSIGNED'
      await connection.query(
        "UPDATE waste_reports SET status = 'ASSIGNED' WHERE report_id = ?",
        [reportId]
      );

      await connection.commit();
      return assignResult.insertId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get all active or filterable tasks assigned to a specific cleaning staff member
   */
  static async getByStaffId(staffId, statusFilter = null) {
    let sql = `
      SELECT 
        a.assignment_id,
        a.assignment_status,
        a.assigned_at,
        a.acknowledged_at,
        a.admin_notes,
        r.report_id,
        r.ticket_code,
        r.description,
        r.priority,
        r.status AS report_status,
        r.created_at AS report_created_at,
        l.zone_name,
        l.building_name,
        l.floor_or_landmark,
        c.category_name,
        c.color_code,
        c.is_hazardous,
        (SELECT image_url FROM before_after_images WHERE report_id = r.report_id AND image_type = 'BEFORE' LIMIT 1) AS before_image,
        (SELECT image_url FROM before_after_images WHERE report_id = r.report_id AND image_type = 'AFTER' LIMIT 1) AS after_image
      FROM assignments a
      JOIN waste_reports r ON a.report_id = r.report_id
      JOIN locations l ON r.location_id = l.location_id
      JOIN waste_categories c ON r.category_id = c.category_id
      WHERE a.staff_id = ?
    `;
    const params = [staffId];

    if (statusFilter) {
      sql += ' AND a.assignment_status = ?';
      params.push(statusFilter);
    } else {
      // By default, exclude completed/reassigned tasks from the active view
      sql += " AND a.assignment_status IN ('ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS')";
    }

    sql += ' ORDER BY FIELD(r.priority, "CRITICAL", "HIGH", "MEDIUM", "LOW"), a.assigned_at DESC';

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  /**
   * Get single assigned task details by assignment_id
   */
  static async getTaskById(assignmentId, staffId = null) {
    let sql = `
      SELECT 
        a.assignment_id,
        a.report_id,
        a.staff_id,
        a.assignment_status,
        a.assigned_at,
        a.acknowledged_at,
        a.admin_notes,
        r.ticket_code,
        r.reporter_id,
        r.description,
        r.priority,
        r.status AS report_status,
        r.created_at AS report_created_at,
        u.full_name AS reporter_name,
        u.phone_number AS reporter_phone,
        l.zone_name,
        l.building_name,
        l.floor_or_landmark,
        c.category_name,
        c.color_code,
        c.is_hazardous,
        (SELECT image_url FROM before_after_images WHERE report_id = r.report_id AND image_type = 'BEFORE' LIMIT 1) AS before_image,
        (SELECT image_url FROM before_after_images WHERE report_id = r.report_id AND image_type = 'AFTER' LIMIT 1) AS after_image
      FROM assignments a
      JOIN waste_reports r ON a.report_id = r.report_id
      JOIN users u ON r.reporter_id = u.user_id
      JOIN locations l ON r.location_id = l.location_id
      JOIN waste_categories c ON r.category_id = c.category_id
      WHERE a.assignment_id = ?
    `;
    const params = [assignmentId];

    if (staffId) {
      sql += ' AND a.staff_id = ?';
      params.push(staffId);
    }

    const [rows] = await pool.query(sql, params);
    return rows[0] || null;
  }

  /**
   * Staff accepts / acknowledges the assigned task
   */
  static async acknowledge(assignmentId, staffId) {
    const [result] = await pool.query(
      `UPDATE assignments 
       SET assignment_status = 'ACKNOWLEDGED', acknowledged_at = CURRENT_TIMESTAMP 
       WHERE assignment_id = ? AND staff_id = ? AND assignment_status = 'ASSIGNED'`,
      [assignmentId, staffId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Staff marks the task as IN_PROGRESS
   */
  static async startWork(assignmentId, staffId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Update assignment status
      const [assignResult] = await connection.query(
        `UPDATE assignments 
         SET assignment_status = 'IN_PROGRESS' 
         WHERE assignment_id = ? AND staff_id = ? AND assignment_status IN ('ASSIGNED', 'ACKNOWLEDGED')`,
        [assignmentId, staffId]
      );

      if (assignResult.affectedRows === 0) {
        await connection.rollback();
        return false;
      }

      // 2. Update report status
      await connection.query(
        `UPDATE waste_reports 
         SET status = 'IN_PROGRESS' 
         WHERE report_id = (SELECT report_id FROM assignments WHERE assignment_id = ?)`,
        [assignmentId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Complete task: Upload "After" photo, log waste collection, and resolve ticket
   */
  static async completeTask({ assignmentId, reportId, staffId, afterImageUrl, remarks = null, wasteWeightKg = null, destination = 'Campus Main Dumpster', fileSizeKb = null }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Update assignment status to 'COMPLETED'
      const [assignResult] = await connection.query(
        `UPDATE assignments 
         SET assignment_status = 'COMPLETED' 
         WHERE assignment_id = ? AND staff_id = ?`,
        [assignmentId, staffId]
      );

      if (assignResult.affectedRows === 0) {
        await connection.rollback();
        return false;
      }

      // 2. Insert "AFTER" proof image
      await connection.query(
        `INSERT INTO before_after_images (report_id, uploaded_by, image_type, image_url, file_size_kb)
         VALUES (?, (SELECT user_id FROM cleaning_staff WHERE staff_id = ?), 'AFTER', ?, ?)`,
        [reportId, staffId, afterImageUrl, fileSizeKb]
      );

      // 3. Insert record in waste_collection
      await connection.query(
        `INSERT INTO waste_collection (assignment_id, report_id, staff_id, waste_weight_kg, disposal_destination, remarks)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [assignmentId, reportId, staffId, wasteWeightKg, destination, remarks]
      );

      // 4. Update waste_reports status to 'RESOLVED'
      await connection.query(
        `UPDATE waste_reports 
         SET status = 'RESOLVED' 
         WHERE report_id = ?`,
        [reportId]
      );

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get history of tasks completed by this cleaning staff member
   */
  static async getCompletedTasks(staffId) {
    const [rows] = await pool.query(
      `SELECT 
        a.assignment_id,
        a.assigned_at,
        wc.collection_time,
        wc.waste_weight_kg,
        wc.disposal_destination,
        wc.remarks AS staff_remarks,
        r.report_id,
        r.ticket_code,
        r.description,
        r.priority,
        l.zone_name,
        l.building_name,
        l.floor_or_landmark,
        c.category_name,
        c.color_code,
        (SELECT image_url FROM before_after_images WHERE report_id = r.report_id AND image_type = 'BEFORE' LIMIT 1) AS before_image,
        (SELECT image_url FROM before_after_images WHERE report_id = r.report_id AND image_type = 'AFTER' LIMIT 1) AS after_image
      FROM assignments a
      JOIN waste_collection wc ON a.assignment_id = wc.assignment_id
      JOIN waste_reports r ON a.report_id = r.report_id
      JOIN locations l ON r.location_id = l.location_id
      JOIN waste_categories c ON r.category_id = c.category_id
      WHERE a.staff_id = ? AND a.assignment_status = 'COMPLETED'
      ORDER BY wc.collection_time DESC`,
      [staffId]
    );
    return rows;
  }
}

module.exports = AssignmentModel;
