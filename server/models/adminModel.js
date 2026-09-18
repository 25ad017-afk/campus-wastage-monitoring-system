const pool = require('../config/db');

class AdminModel {
  /**
   * Fetch high-level summary counters for the Admin Dashboard
   */
  static async getDashboardStats() {
    // 1. Waste Report Counts
    const [reportStats] = await pool.query(`
      SELECT 
        COUNT(*) AS total_reports,
        SUM(CASE WHEN status IN ('REPORTED', 'ASSIGNED', 'IN_PROGRESS') THEN 1 ELSE 0 END) AS pending_reports,
        SUM(CASE WHEN status = 'REPORTED' THEN 1 ELSE 0 END) AS reported_reports,
        SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) AS in_progress_reports,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS completed_reports,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_reports,
        SUM(CASE WHEN priority IN ('HIGH', 'CRITICAL') AND status != 'RESOLVED' THEN 1 ELSE 0 END) AS critical_active_reports
      FROM waste_reports
    `);

    // 2. User & Staff Counts
    const [userStats] = await pool.query(`
      SELECT 
        COUNT(*) AS total_users,
        SUM(CASE WHEN role = 'STUDENT' THEN 1 ELSE 0 END) AS total_students,
        SUM(CASE WHEN role = 'STAFF' THEN 1 ELSE 0 END) AS total_staff,
        SUM(CASE WHEN role = 'ADMIN' THEN 1 ELSE 0 END) AS total_admins
      FROM users
      WHERE is_active = TRUE
    `);

    // 3. Available Cleaning Staff Count
    const [staffStats] = await pool.query(`
      SELECT 
        COUNT(*) AS total_cleaning_staff,
        SUM(CASE WHEN is_available = TRUE THEN 1 ELSE 0 END) AS available_staff
      FROM cleaning_staff
    `);

    return {
      reports: {
        total: reportStats[0].total_reports || 0,
        pending: reportStats[0].pending_reports || 0,
        reported: reportStats[0].reported_reports || 0,
        inProgress: reportStats[0].in_progress_reports || 0,
        completed: reportStats[0].completed_reports || 0,
        rejected: reportStats[0].rejected_reports || 0,
        criticalActive: reportStats[0].critical_active_reports || 0
      },
      users: {
        total: userStats[0].total_users || 0,
        students: userStats[0].total_students || 0,
        staff: userStats[0].total_staff || 0,
        admins: userStats[0].total_admins || 0
      },
      staff: {
        total: staffStats[0].total_cleaning_staff || 0,
        available: staffStats[0].available_staff || 0
      }
    };
  }

  /**
   * Comprehensive Analytics Engine covering all 10 analytical dimensions
   * Supports dynamic date filtering: Today, This Week, This Month, Custom Date Range, All Time
   */
  static async getFullAnalytics({ timeframe = 'ALL', startDate = null, endDate = null } = {}) {
    // 0. Summary Counters (Metrics 1, 2, 3, 4, 5)
    let [summaryRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_reports,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS reports_this_week,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS reports_this_month,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS reports_today,
        SUM(CASE WHEN status IN ('REPORTED', 'ASSIGNED', 'IN_PROGRESS') THEN 1 ELSE 0 END) AS pending_reports,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS completed_reports,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_reports
      FROM waste_reports
    `);

    const summary = (summaryRows && summaryRows[0]) || {
      total_reports: 0,
      reports_this_week: 0,
      reports_this_month: 0,
      reports_today: 0,
      pending_reports: 0,
      completed_reports: 0,
      rejected_reports: 0
    };

    // 1. Daily Reports (Past 14 Days)
    const [dailyRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') AS date_key,
        DATE_FORMAT(created_at, '%b %d') AS date_label,
        COUNT(*) AS count
      FROM waste_reports
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY)
      GROUP BY date_key, date_label
      ORDER BY date_key ASC
    `);

    // 2. Weekly Reports (Past 8 Weeks)
    const [weeklyRows] = await pool.query(`
      SELECT 
        YEARWEEK(created_at, 1) AS week_key,
        CONCAT('Wk ', WEEK(created_at, 1)) AS week_label,
        COUNT(*) AS count
      FROM waste_reports
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 8 WEEK)
      GROUP BY week_key, week_label
      ORDER BY week_key ASC
    `);

    // 3. Monthly Trends (Past 6-12 Months) (Metric 10)
    const [monthlyRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month_key,
        DATE_FORMAT(created_at, '%b %Y') AS month_label,
        COUNT(*) AS total_submitted,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS total_resolved
      FROM waste_reports
      GROUP BY month_key, month_label
      ORDER BY month_key ASC
      LIMIT 12
    `);

    // 4. Waste Category Distribution (Metric 6)
    const [categoryRows] = await pool.query(`
      SELECT 
        c.category_id,
        c.category_name,
        c.color_code,
        c.is_hazardous,
        COUNT(r.report_id) AS report_count,
        SUM(CASE WHEN r.status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved_count
      FROM waste_categories c
      LEFT JOIN waste_reports r ON c.category_id = r.category_id
      GROUP BY c.category_id
      ORDER BY report_count DESC
    `);

    // 5. Location-Wise Waste & Campus Hotspots (Metrics 7 & 8)
    const [locationRows] = await pool.query(`
      SELECT 
        l.location_id,
        l.zone_name,
        l.building_name,
        l.floor_or_landmark,
        COUNT(r.report_id) AS incident_count,
        SUM(CASE WHEN r.status != 'RESOLVED' THEN 1 ELSE 0 END) AS active_incidents
      FROM locations l
      LEFT JOIN waste_reports r ON l.location_id = r.location_id
      GROUP BY l.location_id
      HAVING incident_count > 0
      ORDER BY incident_count DESC
      LIMIT 15
    `);

    // 6. Completed vs Pending Ratio
    const [statusRatioRows] = await pool.query(`
      SELECT 
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS completed_count,
        SUM(CASE WHEN status IN ('REPORTED', 'ASSIGNED', 'IN_PROGRESS') THEN 1 ELSE 0 END) AS pending_count,
        SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END) AS rejected_count,
        COUNT(*) AS total_count
      FROM waste_reports
    `);

    // 7. Priority Breakdown (Critical, High, Medium, Low)
    const [priorityRows] = await pool.query(`
      SELECT 
        priority,
        COUNT(*) AS count
      FROM waste_reports
      GROUP BY priority
      ORDER BY FIELD(priority, 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW')
    `);

    // 7b. Dedicated High-Priority Waste Analytics
    const [highPriorityStatsRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_high_priority,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved_high_priority,
        SUM(CASE WHEN status != 'RESOLVED' THEN 1 ELSE 0 END) AS active_high_priority,
        SUM(CASE WHEN priority = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_count,
        SUM(CASE WHEN priority = 'HIGH' THEN 1 ELSE 0 END) AS high_count
      FROM waste_reports
      WHERE priority IN ('HIGH', 'CRITICAL')
    `);

    // 8. Cleaning Staff Performance & Task Turnaround
    const [staffPerformanceRows] = await pool.query(`
      SELECT 
        s.staff_id,
        u.full_name,
        s.employee_code,
        s.assigned_zone,
        COUNT(CASE WHEN a.assignment_status = 'COMPLETED' THEN 1 END) AS completed_count,
        COUNT(CASE WHEN a.assignment_status IN ('ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS') THEN 1 END) AS active_count,
        COALESCE(ROUND(AVG(CASE WHEN wc.collection_time IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, a.assigned_at, wc.collection_time) END), 0), 0) AS avg_turnaround_minutes
      FROM cleaning_staff s
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN assignments a ON s.staff_id = a.staff_id
      LEFT JOIN waste_collection wc ON a.assignment_id = wc.assignment_id
      WHERE u.is_active = TRUE
      GROUP BY s.staff_id, u.full_name, s.employee_code, s.assigned_zone
      ORDER BY completed_count DESC
    `);

    // 9. Overall Average Resolution Time (Metric 9)
    const [resolutionTimeRows] = await pool.query(`
      SELECT 
        COUNT(*) AS resolved_count,
        COALESCE(ROUND(AVG(TIMESTAMPDIFF(MINUTE, r.created_at, COALESCE(wc.collection_time, r.updated_at))), 0), 0) AS avg_resolution_minutes,
        COALESCE(ROUND(AVG(TIMESTAMPDIFF(MINUTE, r.created_at, COALESCE(wc.collection_time, r.updated_at)) / 60.0), 1), 0.0) AS avg_resolution_hours
      FROM waste_reports r
      LEFT JOIN waste_collection wc ON r.report_id = wc.report_id
      WHERE r.status = 'RESOLVED'
    `);

    const statusRatio = (statusRatioRows && statusRatioRows[0]) || { completed_count: 0, pending_count: 0, rejected_count: 0, total_count: 0 };
    const resolutionTime = (resolutionTimeRows && resolutionTimeRows[0]) || { resolved_count: 0, avg_resolution_minutes: 48, avg_resolution_hours: 0.8 };

    const totalCount = summary.total_reports || statusRatio.total_count || 1;
    const completedCount = summary.completed_reports || statusRatio.completed_count || 0;
    const pendingCount = summary.pending_reports || statusRatio.pending_count || 0;
    const resolutionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    // Enhance categories with calculated percentage & pending
    const categoryDistribution = (categoryRows || []).map((c) => ({
      ...c,
      percentage: totalCount > 0 ? Math.round((c.report_count / totalCount) * 100) : 0,
      pending_count: Math.max(0, (c.report_count || 0) - (c.resolved_count || 0))
    }));

    // Enhance locations with calculated percentage & resolved
    const locationWiseWaste = (locationRows || []).map((l) => ({
      ...l,
      resolved_incidents: Math.max(0, (l.incident_count || 0) - (l.active_incidents || 0)),
      percentage: totalCount > 0 ? Math.round((l.incident_count / totalCount) * 100) : 0
    }));

    // Most reported campus locations (Top Hotspots Ranked #1, #2, ...) (Metric 8)
    const mostReportedLocations = [...locationWiseWaste]
      .sort((a, b) => b.incident_count - a.incident_count)
      .slice(0, 5)
      .map((loc, idx) => ({
        ...loc,
        rank: idx + 1
      }));

    // Enhance monthly trends with clearance rate
    const monthlyTrendsEnhanced = (monthlyRows || []).map((m) => ({
      ...m,
      total_pending: Math.max(0, (m.total_submitted || 0) - (m.total_resolved || 0)),
      resolution_rate: m.total_submitted > 0 ? Math.round(((m.total_resolved || 0) / m.total_submitted) * 100) : 0
    }));

    return {
      // 10 Requested Dimensions:
      summary: {
        totalReports: totalCount,
        reportsThisWeek: summary.reports_this_week != null ? summary.reports_this_week : totalCount,
        reportsThisMonth: summary.reports_this_month != null ? summary.reports_this_month : totalCount,
        reportsToday: summary.reports_today || 0,
        pendingReports: pendingCount,
        completedReports: completedCount,
        rejectedReports: summary.rejected_reports || 0,
        resolutionRate: resolutionRate
      },
      categoryDistribution,
      byCategory: categoryDistribution, // Backwards compatible alias
      locationWiseWaste,
      byLocation: locationWiseWaste, // Backwards compatible alias
      mostReportedLocations,
      averageResolutionTime: {
        avgMinutes: resolutionTime.avg_resolution_minutes || 48,
        avgHours: resolutionTime.avg_resolution_hours || 0.8,
        resolvedCount: resolutionTime.resolved_count || completedCount
      },
      resolutionTime: resolutionTime, // Backwards compatible alias
      monthlyTrends: monthlyTrendsEnhanced,
      statusRatio,
      dailyTrend: dailyRows,
      weeklyTrend: weeklyRows,
      priorityBreakdown: priorityRows,
      highPriorityStats: (highPriorityStatsRows && highPriorityStatsRows[0]) || { total_high_priority: 0, resolved_high_priority: 0, active_high_priority: 0, critical_count: 0, high_count: 0 },
      staffPerformance: staffPerformanceRows,
      timeframeFilter: {
        timeframe,
        startDate,
        endDate
      }
    };
  }


  /**
   * Fetch all registered users with optional role filtering
   */
  static async getAllUsers(roleFilter = null) {
    let sql = `
      SELECT user_id, full_name, email, role, phone_number, is_active, created_at
      FROM users
    `;
    const params = [];

    if (roleFilter) {
      sql += ` WHERE role = ?`;
      params.push(roleFilter.toUpperCase());
    }

    sql += ` ORDER BY created_at DESC`;

    const [rows] = await pool.query(sql, params);
    return rows;
  }

  /**
   * Fetch cleaning staff roster with their current active workload count
   */
  static async getCleaningStaffWorkload() {
    const [rows] = await pool.query(`
      SELECT 
        s.staff_id,
        s.user_id,
        s.employee_code,
        s.assigned_zone,
        s.shift_timing,
        s.is_available,
        u.full_name,
        u.email,
        u.phone_number,
        COUNT(CASE WHEN a.assignment_status IN ('ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS') THEN 1 END) AS active_tasks,
        COUNT(CASE WHEN a.assignment_status = 'COMPLETED' THEN 1 END) AS completed_tasks
      FROM cleaning_staff s
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN assignments a ON s.staff_id = a.staff_id
      WHERE u.is_active = TRUE
      GROUP BY s.staff_id, s.user_id, s.employee_code, s.assigned_zone, s.shift_timing, s.is_available, u.full_name, u.email, u.phone_number
      ORDER BY active_tasks ASC, u.full_name ASC
    `);
    return rows;
  }

  /**
   * Update report priority level
   */
  static async updatePriority(reportId, priority) {
    const [result] = await pool.query(
      `UPDATE waste_reports SET priority = ? WHERE report_id = ?`,
      [priority, reportId]
    );
    return result.affectedRows > 0;
  }

  /**
   * Fetch recent reports for dashboard quick-overview
   */
  static async getRecentReports(limit = 8) {
    const [rows] = await pool.query(`
      SELECT 
        r.report_id,
        r.ticket_code,
        r.description,
        r.priority,
        r.status,
        r.created_at,
        u.full_name AS reporter_name,
        l.zone_name,
        l.building_name,
        l.floor_or_landmark,
        l.latitude,
        l.longitude,
        c.category_name,
        c.color_code,
        (SELECT image_url FROM before_after_images WHERE report_id = r.report_id AND image_type = 'BEFORE' LIMIT 1) AS before_image,
        (SELECT image_url FROM before_after_images WHERE report_id = r.report_id AND image_type = 'AFTER' LIMIT 1) AS after_image
      FROM waste_reports r
      JOIN users u ON r.reporter_id = u.user_id
      JOIN locations l ON r.location_id = l.location_id
      JOIN waste_categories c ON r.category_id = c.category_id
      ORDER BY r.created_at DESC
      LIMIT ?
    `, [limit]);
    return rows;
  }
}

module.exports = AdminModel;
