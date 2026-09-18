const pool = require('../config/db');

class LocationModel {
  /**
   * Get all campus locations
   */
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT location_id, zone_name, building_name, floor_or_landmark, latitude, longitude FROM locations ORDER BY zone_name, building_name ASC'
    );
    return rows;
  }

  /**
   * Find location by ID
   */
  static async findById(locationId) {
    const [rows] = await pool.query(
      'SELECT location_id, zone_name, building_name, floor_or_landmark, latitude, longitude FROM locations WHERE location_id = ? LIMIT 1',
      [locationId]
    );
    return rows[0] || null;
  }

  /**
   * Create a new campus location (Admin only)
   */
  static async create({ zoneName, buildingName, floorOrLandmark, latitude = null, longitude = null }) {
    const [result] = await pool.query(
      'INSERT INTO locations (zone_name, building_name, floor_or_landmark, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
      [zoneName, buildingName, floorOrLandmark, latitude, longitude]
    );
    return result.insertId;
  }

  /**
   * Get all distinct campus zones
   */
  static async getZones() {
    const [rows] = await pool.query('SELECT DISTINCT zone_name FROM locations ORDER BY zone_name ASC');
    const names = rows.map(r => (typeof r === 'string' ? r : (r.zone_name || r.name || ''))).filter(Boolean);
    return Array.from(new Set(names));
  }

  /**
   * Get all waste categories
   */
  static async getCategories() {
    const [rows] = await pool.query(
      'SELECT category_id, category_name, description, color_code, is_hazardous FROM waste_categories ORDER BY category_id ASC'
    );
    return rows;
  }
}

module.exports = LocationModel;

