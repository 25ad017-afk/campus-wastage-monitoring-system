const bcrypt = require('bcryptjs');

// In-Memory Database Store seeded with schema & seed.sql records
class EmbeddedDatabase {
  constructor() {
    this.reset();
  }

  reset() {
    this.categories = [
      { category_id: 1, category_name: 'Dry / Recyclable', description: 'Cardboard, paper, clean plastic bottles, soda cans', color_code: '#3b82f6', is_hazardous: 0 },
      { category_id: 2, category_name: 'Wet / Organic', description: 'Food leftovers, cafeteria waste, leaves, compostable matter', color_code: '#22c55e', is_hazardous: 0 },
      { category_id: 3, category_name: 'E-Waste', description: 'Broken circuit boards, charging cables, batteries, monitors', color_code: '#eab308', is_hazardous: 0 },
      { category_id: 4, category_name: 'Hazardous / Chemical', description: 'Laboratory chemicals, broken glassware, medical waste', color_code: '#ef4444', is_hazardous: 1 },
      { category_id: 5, category_name: 'General / Mixed Litter', description: 'Multi-layer packaging, street sweepings, wrappers', color_code: '#64748b', is_hazardous: 0 }
    ];

    this.locations = [
      // 1. Academic Area
      { location_id: 1, zone_name: 'Academic Area', building_name: 'Academic Area', floor_or_landmark: 'Classrooms', latitude: 10.8265, longitude: 77.0195 },
      { location_id: 2, zone_name: 'Academic Area', building_name: 'Academic Area', floor_or_landmark: 'Smart Classrooms', latitude: 10.8266, longitude: 77.0196 },
      { location_id: 3, zone_name: 'Academic Area', building_name: 'Academic Area', floor_or_landmark: 'Academic Corridor', latitude: 10.8267, longitude: 77.0197 },
      { location_id: 4, zone_name: 'Academic Area', building_name: 'Academic Area', floor_or_landmark: 'Academic Common Area', latitude: 10.8268, longitude: 77.0198 },

      // 2. Central Library
      { location_id: 5, zone_name: 'Central Library', building_name: 'Central Library', floor_or_landmark: 'Central Library Entrance', latitude: 10.8269, longitude: 77.0188 },
      { location_id: 6, zone_name: 'Central Library', building_name: 'Central Library', floor_or_landmark: 'Reading Area', latitude: 10.8270, longitude: 77.0189 },
      { location_id: 7, zone_name: 'Central Library', building_name: 'Central Library', floor_or_landmark: 'Library Common Area', latitude: 10.8271, longitude: 77.0190 },

      // 3. Laboratory Area
      { location_id: 8, zone_name: 'Laboratory Area', building_name: 'Laboratory Area', floor_or_landmark: 'Laboratory Entrance', latitude: 10.8272, longitude: 77.0192 },
      { location_id: 9, zone_name: 'Laboratory Area', building_name: 'Laboratory Area', floor_or_landmark: 'Computer Laboratory', latitude: 10.8273, longitude: 77.0193 },
      { location_id: 10, zone_name: 'Laboratory Area', building_name: 'Laboratory Area', floor_or_landmark: 'Engineering Laboratory', latitude: 10.8274, longitude: 77.0194 },
      { location_id: 11, zone_name: 'Laboratory Area', building_name: 'Laboratory Area', floor_or_landmark: 'Laboratory Common Area', latitude: 10.8275, longitude: 77.0195 },

      // 4. Smart Classroom Area
      { location_id: 12, zone_name: 'Smart Classroom Area', building_name: 'Smart Classroom Area', floor_or_landmark: 'Smart Classroom Entrance', latitude: 10.8276, longitude: 77.0198 },
      { location_id: 13, zone_name: 'Smart Classroom Area', building_name: 'Smart Classroom Area', floor_or_landmark: 'Smart Classroom', latitude: 10.8277, longitude: 77.0199 },
      { location_id: 14, zone_name: 'Smart Classroom Area', building_name: 'Smart Classroom Area', floor_or_landmark: 'Smart Classroom Common Area', latitude: 10.8278, longitude: 77.0200 },

      // 5. Administrative / Office Area
      { location_id: 15, zone_name: 'Administrative / Office Area', building_name: 'Administrative / Office Area', floor_or_landmark: 'Administrative Office', latitude: 10.8258, longitude: 77.0190 },
      { location_id: 16, zone_name: 'Administrative / Office Area', building_name: 'Administrative / Office Area', floor_or_landmark: 'Principal / Administration Area', latitude: 10.8259, longitude: 77.0191 },
      { location_id: 17, zone_name: 'Administrative / Office Area', building_name: 'Administrative / Office Area', floor_or_landmark: 'Office Common Area', latitude: 10.8257, longitude: 77.0189 },
      { location_id: 18, zone_name: 'Administrative / Office Area', building_name: 'Administrative / Office Area', floor_or_landmark: 'Controller of Examinations Office', latitude: 10.8256, longitude: 77.0188 },

      // 6. Conference Hall
      { location_id: 19, zone_name: 'Conference Hall', building_name: 'Conference Hall', floor_or_landmark: 'Conference Hall Entrance', latitude: 10.8262, longitude: 77.0210 },
      { location_id: 20, zone_name: 'Conference Hall', building_name: 'Conference Hall', floor_or_landmark: 'Conference Hall', latitude: 10.8263, longitude: 77.0211 },

      // 7. Guest Room & TV Hall
      { location_id: 21, zone_name: 'Guest Room & TV Hall', building_name: 'Guest Room & TV Hall', floor_or_landmark: 'Guest Room', latitude: 10.8254, longitude: 77.0215 },
      { location_id: 22, zone_name: 'Guest Room & TV Hall', building_name: 'Guest Room & TV Hall', floor_or_landmark: 'TV Hall', latitude: 10.8255, longitude: 77.0216 },

      // 8. Food Court & Amenity Center
      { location_id: 23, zone_name: 'Food Court & Amenity Center', building_name: 'Food Court & Amenity Center', floor_or_landmark: 'Food Court', latitude: 10.8272, longitude: 77.0210 },
      { location_id: 24, zone_name: 'Food Court & Amenity Center', building_name: 'Food Court & Amenity Center', floor_or_landmark: 'Amenity Center', latitude: 10.8273, longitude: 77.0211 },
      { location_id: 25, zone_name: 'Food Court & Amenity Center', building_name: 'Food Court & Amenity Center', floor_or_landmark: 'Food Court Entrance', latitude: 10.8274, longitude: 77.0212 },
      { location_id: 26, zone_name: 'Food Court & Amenity Center', building_name: 'Food Court & Amenity Center', floor_or_landmark: 'Food Waste Collection Area', latitude: 10.8275, longitude: 77.0213 },

      // 9. Hostel Area
      { location_id: 27, zone_name: 'Hostel Area', building_name: 'Hostel Area', floor_or_landmark: 'Hostel Entrance', latitude: 10.8295, longitude: 77.0180 },
      { location_id: 28, zone_name: 'Hostel Area', building_name: 'Hostel Area', floor_or_landmark: 'Hostel Common Area', latitude: 10.8296, longitude: 77.0181 },
      { location_id: 29, zone_name: 'Hostel Area', building_name: 'Hostel Area', floor_or_landmark: 'Hostel Dining Area', latitude: 10.8297, longitude: 77.0182 },
      { location_id: 30, zone_name: 'Hostel Area', building_name: 'Hostel Area', floor_or_landmark: 'Hostel Waste Collection Area', latitude: 10.8298, longitude: 77.0183 },

      // 10. Sports Area
      { location_id: 31, zone_name: 'Sports Area', building_name: 'Sports Area', floor_or_landmark: 'Sports Ground', latitude: 10.8280, longitude: 77.0235 },
      { location_id: 32, zone_name: 'Sports Area', building_name: 'Sports Area', floor_or_landmark: 'Sports Facilities', latitude: 10.8281, longitude: 77.0236 },
      { location_id: 33, zone_name: 'Sports Area', building_name: 'Sports Area', floor_or_landmark: 'Sports Common Area', latitude: 10.8282, longitude: 77.0237 },

      // 11. Fitness Centre
      { location_id: 34, zone_name: 'Fitness Centre', building_name: 'Fitness Centre', floor_or_landmark: 'Fitness Centre Entrance', latitude: 10.8285, longitude: 77.0238 },
      { location_id: 35, zone_name: 'Fitness Centre', building_name: 'Fitness Centre', floor_or_landmark: 'Fitness Centre', latitude: 10.8286, longitude: 77.0239 },

      // 12. Transport Area
      { location_id: 36, zone_name: 'Transport Area', building_name: 'Transport Area', floor_or_landmark: 'College Bus Area', latitude: 10.8248, longitude: 77.0175 },
      { location_id: 37, zone_name: 'Transport Area', building_name: 'Transport Area', floor_or_landmark: 'Bus Parking Area', latitude: 10.8249, longitude: 77.0176 },
      { location_id: 38, zone_name: 'Transport Area', building_name: 'Transport Area', floor_or_landmark: 'Transport Area', latitude: 10.8247, longitude: 77.0174 },

      // 13. Main Entrance
      { location_id: 39, zone_name: 'Main Entrance', building_name: 'Main Entrance', floor_or_landmark: 'Main Gate', latitude: 10.8250, longitude: 77.0180 },
      { location_id: 40, zone_name: 'Main Entrance', building_name: 'Main Entrance', floor_or_landmark: 'Entrance Road', latitude: 10.8251, longitude: 77.0181 },
      { location_id: 41, zone_name: 'Main Entrance', building_name: 'Main Entrance', floor_or_landmark: 'Security Area', latitude: 10.8252, longitude: 77.0182 },
      { location_id: 42, zone_name: 'Main Entrance', building_name: 'Main Entrance', floor_or_landmark: 'Visitor Area', latitude: 10.8253, longitude: 77.0183 },

      // 14. Campus Internal Area
      { location_id: 43, zone_name: 'Campus Internal Area', building_name: 'Campus Internal Area', floor_or_landmark: 'Internal Road', latitude: 10.8260, longitude: 77.0198 },
      { location_id: 44, zone_name: 'Campus Internal Area', building_name: 'Campus Internal Area', floor_or_landmark: 'Walkway', latitude: 10.8261, longitude: 77.0199 },
      { location_id: 45, zone_name: 'Campus Internal Area', building_name: 'Campus Internal Area', floor_or_landmark: 'Common Campus Area', latitude: 10.8262, longitude: 77.0200 },

      // 15. Green Campus Area
      { location_id: 46, zone_name: 'Green Campus Area', building_name: 'Green Campus Area', floor_or_landmark: 'Garden Area', latitude: 10.8242, longitude: 77.0212 },
      { location_id: 47, zone_name: 'Green Campus Area', building_name: 'Green Campus Area', floor_or_landmark: 'Green Campus Area', latitude: 10.8243, longitude: 77.0213 },
      { location_id: 48, zone_name: 'Green Campus Area', building_name: 'Green Campus Area', floor_or_landmark: 'Open Campus Area', latitude: 10.8244, longitude: 77.0214 },

      // 16. Student Activity Area
      { location_id: 49, zone_name: 'Student Activity Area', building_name: 'Student Activity Area', floor_or_landmark: 'Student Activity Area', latitude: 10.8276, longitude: 77.0225 },
      { location_id: 50, zone_name: 'Student Activity Area', building_name: 'Student Activity Area', floor_or_landmark: 'Club / Activity Area', latitude: 10.8277, longitude: 77.0226 },
      { location_id: 51, zone_name: 'Student Activity Area', building_name: 'Student Activity Area', floor_or_landmark: 'Event Area', latitude: 10.8278, longitude: 77.0227 },

      // 17. Waste Collection Area
      { location_id: 52, zone_name: 'Waste Collection Area', building_name: 'Waste Collection Area', floor_or_landmark: 'Main Waste Collection Point', latitude: 10.8245, longitude: 77.0220 },
      { location_id: 53, zone_name: 'Waste Collection Area', building_name: 'Waste Collection Area', floor_or_landmark: 'Segregated Waste Collection Area', latitude: 10.8246, longitude: 77.0221 },
      { location_id: 54, zone_name: 'Waste Collection Area', building_name: 'Waste Collection Area', floor_or_landmark: 'Waste Storage Area', latitude: 10.8247, longitude: 77.0222 },

      // 18. Other Campus Area
      { location_id: 55, zone_name: 'Other Campus Area', building_name: 'Other Campus Area', floor_or_landmark: 'Other Location', latitude: 10.8240, longitude: 77.0210 },

      // 19. Official ACET Master Map Specific Blocks & Locations
      { location_id: 56, zone_name: 'Main Block', building_name: 'Main Block', floor_or_landmark: 'Central Administration & Principal Office', latitude: 10.8260, longitude: 77.0200 },
      { location_id: 57, zone_name: 'Main Block', building_name: 'Main Block', floor_or_landmark: 'Reception Lobby & Board Room', latitude: 10.8261, longitude: 77.0201 },
      { location_id: 58, zone_name: 'A Block', building_name: 'A Block', floor_or_landmark: 'ECE Department & Central Library (Ground Floor)', latitude: 10.8268, longitude: 77.0185 },
      { location_id: 59, zone_name: 'B Block', building_name: 'B Block', floor_or_landmark: 'CSE Department & AI Computing Labs', latitude: 10.8270, longitude: 77.0190 },
      { location_id: 60, zone_name: 'C Block', building_name: 'C Block', floor_or_landmark: 'CSE Clusters & Smart Seminar Halls', latitude: 10.8272, longitude: 77.0195 },
      { location_id: 61, zone_name: 'D Block', building_name: 'D Block', floor_or_landmark: 'Science & Humanities (S&H) / First Year Labs', latitude: 10.8274, longitude: 77.0202 },
      { location_id: 62, zone_name: 'E Block', building_name: 'E Block', floor_or_landmark: 'CIVIL, MECH, EEE, MECT & CAD/CAM Labs', latitude: 10.8276, longitude: 77.0208 },
      { location_id: 63, zone_name: 'Centres of Excellence', building_name: 'Centres of Excellence', floor_or_landmark: 'Akshaya Thulir Pre-incubation & Research Hub', latitude: 10.8278, longitude: 77.0215 },
      { location_id: 64, zone_name: 'Workshop', building_name: 'Workshop', floor_or_landmark: 'Machine Shop, Foundry & Welding Units', latitude: 10.8265, longitude: 77.0182 },
      { location_id: 65, zone_name: 'Training Centre', building_name: 'Training Centre', floor_or_landmark: 'Placement & Corporate Training Cell', latitude: 10.8266, longitude: 77.0188 },
      { location_id: 66, zone_name: 'Auditorium', building_name: 'Auditorium', floor_or_landmark: 'Main Auditorium (1500+ Capacity)', latitude: 10.8265, longitude: 77.0220 },
      { location_id: 67, zone_name: 'Food Court & Amenities', building_name: 'Food Court & Amenities', floor_or_landmark: 'Dining Hall & Central Kitchen', latitude: 10.8268, longitude: 77.0222 },
      { location_id: 68, zone_name: 'Cafeteria', building_name: 'Cafeteria', floor_or_landmark: 'Cafeteria & Refreshment Kiosk', latitude: 10.8258, longitude: 77.0205 },
      { location_id: 69, zone_name: 'Recreation Center', building_name: 'Recreation Center', floor_or_landmark: 'Indoor Games & Student Activity Wing', latitude: 10.8252, longitude: 77.0185 },
      { location_id: 70, zone_name: 'Gym', building_name: 'Gym', floor_or_landmark: 'Fitness Center & Gymnasium', latitude: 10.8253, longitude: 77.0189 },
      { location_id: 71, zone_name: 'Boys Hostel', building_name: 'Boys Hostel', floor_or_landmark: 'Boys Hostel Residential Blocks & Mess', latitude: 10.8245, longitude: 77.0185 },
      { location_id: 72, zone_name: 'Girls Hostel', building_name: 'Girls Hostel', floor_or_landmark: 'Girls Hostel Residential Blocks & Mess', latitude: 10.8245, longitude: 77.0192 },
      { location_id: 73, zone_name: 'Playground', building_name: 'Playground', floor_or_landmark: 'Main Athletic Track & Sports Ground', latitude: 10.8255, longitude: 77.0228 },
      { location_id: 74, zone_name: 'Basketball Court', building_name: 'Basketball Court', floor_or_landmark: 'Outdoor Synthetic Basketball Court', latitude: 10.8257, longitude: 77.0225 },
      { location_id: 75, zone_name: 'Volleyball Court', building_name: 'Volleyball Court', floor_or_landmark: 'Volleyball Court', latitude: 10.8256, longitude: 77.0227 },
      { location_id: 76, zone_name: 'Kabaddi Court', building_name: 'Kabaddi Court', floor_or_landmark: 'Kabaddi Court', latitude: 10.8254, longitude: 77.0229 },
      { location_id: 77, zone_name: 'Ball Badminton Court', building_name: 'Ball Badminton Court', floor_or_landmark: 'Ball Badminton Court', latitude: 10.8253, longitude: 77.0231 },
      { location_id: 78, zone_name: 'Cricket Nets', building_name: 'Cricket Nets', floor_or_landmark: 'Cricket Practice Nets & Pavilion', latitude: 10.8250, longitude: 77.0228 },
      { location_id: 79, zone_name: 'Temple', building_name: 'Temple', floor_or_landmark: 'Campus Vinayagar Temple', latitude: 10.8255, longitude: 77.0202 },
      { location_id: 80, zone_name: 'ATM', building_name: 'ATM', floor_or_landmark: 'Campus Bank ATM Counter', latitude: 10.8257, longitude: 77.0206 },
      { location_id: 81, zone_name: 'Power House', building_name: 'Power House', floor_or_landmark: 'Power House & Electrical Substation', latitude: 10.8256, longitude: 77.0212 },
      { location_id: 82, zone_name: 'Transformer', building_name: 'Transformer', floor_or_landmark: 'High-Voltage Transformer Yard', latitude: 10.8255, longitude: 77.0214 },
      { location_id: 83, zone_name: 'Parking', building_name: 'Parking', floor_or_landmark: 'Faculty, Student & Bus Parking Bays', latitude: 10.8250, longitude: 77.0208 },
      { location_id: 84, zone_name: 'Security Gate 1', building_name: 'Security Gate 1', floor_or_landmark: 'Security Gate 1 (Main Campus Entrance)', latitude: 10.8242, longitude: 77.0200 },
      { location_id: 85, zone_name: 'Security Gate 2', building_name: 'Security Gate 2', floor_or_landmark: 'Security Gate 2 (Service / Transport Gate)', latitude: 10.8242, longitude: 77.0208 }
    ];

    this.users = [
      {
        user_id: 1,
        full_name: 'Campus Chief Administrator',
        email: 'admin@acetcbe.edu.in',
        password_hash: bcrypt.hashSync('Admin@123', 10),
        role: 'ADMIN',
        phone_number: '9876543210',
        is_active: 1,
        is_email_verified: 1,
        created_at: new Date('2026-01-01T08:00:00Z')
      },
      {
        user_id: 2,
        full_name: 'Ramesh Kumar (Cleaning Crew)',
        email: 'ramesh.staff@acetcbe.edu.in',
        password_hash: bcrypt.hashSync('Staff@123', 10),
        role: 'STAFF',
        phone_number: '9876543211',
        is_active: 1,
        is_email_verified: 1,
        created_at: new Date('2026-01-02T08:00:00Z')
      },
      {
        user_id: 3,
        full_name: 'Priya Sharma (Student)',
        email: 'priya.student@acetcbe.edu.in',
        password_hash: bcrypt.hashSync('Student@123', 10),
        role: 'STUDENT',
        phone_number: '9876543212',
        is_active: 1,
        is_email_verified: 1,
        created_at: new Date('2026-01-03T08:00:00Z')
      }
    ];

    this.cleaning_staff = [
      {
        staff_id: 1,
        user_id: 2,
        employee_code: 'STF-2026-01',
        assigned_zone: 'Academic Area',
        shift_timing: 'MORNING',
        is_available: 1,
        created_at: new Date('2026-01-02T08:00:00Z')
      }
    ];

    this.waste_reports = [
      {
        report_id: 1,
        ticket_code: 'CWMS-2026-10492',
        reporter_id: 3,
        location_id: 26,
        category_id: 2,
        description: 'Food waste and discarded food containers at food waste collection area.',
        priority: 'HIGH',
        status: 'ASSIGNED',
        created_at: new Date(Date.now() - 3600000 * 4),
        updated_at: new Date(Date.now() - 3600000 * 2)
      },
      {
        report_id: 2,
        ticket_code: 'CWMS-2026-84910',
        reporter_id: 3,
        location_id: 3,
        category_id: 1,
        description: 'Cardboard packaging and papers left near academic corridor bins.',
        priority: 'MEDIUM',
        status: 'REPORTED',
        created_at: new Date(Date.now() - 3600000 * 2),
        updated_at: new Date(Date.now() - 3600000 * 2)
      },
      {
        report_id: 3,
        ticket_code: 'CWMS-2026-55201',
        reporter_id: 3,
        location_id: 6,
        category_id: 1,
        description: 'Library reading area paper bins cleared and sorted.',
        priority: 'LOW',
        status: 'RESOLVED',
        created_at: new Date(Date.now() - 3600000 * 24),
        updated_at: new Date(Date.now() - 3600000 * 20)
      }
    ];

    this.before_after_images = [
      { image_id: 1, report_id: 1, uploaded_by: 3, image_type: 'BEFORE', image_url: '/uploads/reports/sample-cafeteria.jpg', file_size_kb: 450, uploaded_at: new Date(Date.now() - 3600000 * 4) },
      { image_id: 2, report_id: 2, uploaded_by: 3, image_type: 'BEFORE', image_url: '/uploads/reports/sample-cartons.jpg', file_size_kb: 380, uploaded_at: new Date(Date.now() - 3600000 * 2) },
      { image_id: 3, report_id: 3, uploaded_by: 3, image_type: 'BEFORE', image_url: '/uploads/reports/sample-library.jpg', file_size_kb: 310, uploaded_at: new Date(Date.now() - 3600000 * 24) },
      { image_id: 4, report_id: 3, uploaded_by: 2, image_type: 'AFTER', image_url: '/uploads/resolutions/sample-resolved.jpg', file_size_kb: 290, uploaded_at: new Date(Date.now() - 3600000 * 20) }
    ];

    this.assignments = [
      {
        assignment_id: 1,
        report_id: 1,
        staff_id: 1,
        assigned_by: 1,
        assignment_status: 'ASSIGNED',
        assigned_at: new Date(Date.now() - 3600000 * 2),
        acknowledged_at: null,
        admin_notes: 'Please clear cafeteria patio before lunch surge.'
      },
      {
        assignment_id: 2,
        report_id: 3,
        staff_id: 1,
        assigned_by: 1,
        assignment_status: 'COMPLETED',
        assigned_at: new Date(Date.now() - 3600000 * 23),
        acknowledged_at: new Date(Date.now() - 3600000 * 22),
        admin_notes: 'Routine library round.'
      }
    ];

    this.waste_collection = [
      {
        collection_id: 1,
        assignment_id: 2,
        report_id: 3,
        staff_id: 1,
        collection_time: new Date(Date.now() - 3600000 * 20),
        waste_weight_kg: 8.5,
        disposal_destination: 'Campus Paper Recycling Unit',
        remarks: 'Cleared all bins, swept floor.'
      }
    ];

    this.notifications = [
      {
        notification_id: 1,
        recipient_id: 1,
        report_id: 1,
        title: 'New Waste Incident Filed',
        message: 'Ticket #CWMS-2026-10492 reported at Student Cafeteria (HIGH priority).',
        notification_type: 'REPORT_FILED',
        is_read: 0,
        created_at: new Date(Date.now() - 3600000 * 4)
      }
    ];

    this.autoIds = {
      user_id: 4,
      staff_id: 2,
      report_id: 4,
      image_id: 5,
      assignment_id: 3,
      collection_id: 2,
      notification_id: 2
    };
  }

  resetDemoData() {
    this.reset();
    return {
      success: true,
      message: 'Database reset to clean baseline state.',
      reportsCount: this.waste_reports.length,
      usersCount: this.users.length,
      staffCount: this.cleaning_staff.length
    };
  }

  loadDemoData() {
    const passwordHash = bcrypt.hashSync('Student@123', 10);
    const staffHash = bcrypt.hashSync('Staff@123', 10);
    const adminHash = bcrypt.hashSync('Admin@123', 10);

    // 1. Categories
    this.categories = [
      { category_id: 1, category_name: 'Dry / Recyclable', description: 'Cardboard, paper, clean plastic bottles, soda cans', color_code: '#3b82f6', is_hazardous: 0 },
      { category_id: 2, category_name: 'Wet / Organic', description: 'Food leftovers, cafeteria waste, leaves, compostable matter', color_code: '#22c55e', is_hazardous: 0 },
      { category_id: 3, category_name: 'E-Waste', description: 'Broken circuit boards, charging cables, batteries, monitors', color_code: '#eab308', is_hazardous: 0 },
      { category_id: 4, category_name: 'Hazardous / Chemical', description: 'Laboratory chemicals, broken glassware, medical waste', color_code: '#ef4444', is_hazardous: 1 },
      { category_id: 5, category_name: 'General / Mixed Litter', description: 'Multi-layer packaging, street sweepings, wrappers', color_code: '#64748b', is_hazardous: 0 }
    ];

    // 2. Locations (Complete list of 55 ACET monitored campus locations across all 18 zones)
    this.locations = [
      // 1. Academic Area
      { location_id: 1, zone_name: 'Academic Area', building_name: 'Academic Area', floor_or_landmark: 'Classrooms', latitude: 10.8265, longitude: 77.0195 },
      { location_id: 2, zone_name: 'Academic Area', building_name: 'Academic Area', floor_or_landmark: 'Smart Classrooms', latitude: 10.8266, longitude: 77.0196 },
      { location_id: 3, zone_name: 'Academic Area', building_name: 'Academic Area', floor_or_landmark: 'Academic Corridor', latitude: 10.8267, longitude: 77.0197 },
      { location_id: 4, zone_name: 'Academic Area', building_name: 'Academic Area', floor_or_landmark: 'Academic Common Area', latitude: 10.8268, longitude: 77.0198 },

      // 2. Central Library
      { location_id: 5, zone_name: 'Central Library', building_name: 'Central Library', floor_or_landmark: 'Central Library Entrance', latitude: 10.8269, longitude: 77.0188 },
      { location_id: 6, zone_name: 'Central Library', building_name: 'Central Library', floor_or_landmark: 'Reading Area', latitude: 10.8270, longitude: 77.0189 },
      { location_id: 7, zone_name: 'Central Library', building_name: 'Central Library', floor_or_landmark: 'Library Common Area', latitude: 10.8271, longitude: 77.0190 },

      // 3. Laboratory Area
      { location_id: 8, zone_name: 'Laboratory Area', building_name: 'Laboratory Area', floor_or_landmark: 'Laboratory Entrance', latitude: 10.8272, longitude: 77.0192 },
      { location_id: 9, zone_name: 'Laboratory Area', building_name: 'Laboratory Area', floor_or_landmark: 'Computer Laboratory', latitude: 10.8273, longitude: 77.0193 },
      { location_id: 10, zone_name: 'Laboratory Area', building_name: 'Laboratory Area', floor_or_landmark: 'Engineering Laboratory', latitude: 10.8274, longitude: 77.0194 },
      { location_id: 11, zone_name: 'Laboratory Area', building_name: 'Laboratory Area', floor_or_landmark: 'Laboratory Common Area', latitude: 10.8275, longitude: 77.0195 },

      // 4. Smart Classroom Area
      { location_id: 12, zone_name: 'Smart Classroom Area', building_name: 'Smart Classroom Area', floor_or_landmark: 'Smart Classroom Entrance', latitude: 10.8276, longitude: 77.0198 },
      { location_id: 13, zone_name: 'Smart Classroom Area', building_name: 'Smart Classroom Area', floor_or_landmark: 'Smart Classroom', latitude: 10.8277, longitude: 77.0199 },
      { location_id: 14, zone_name: 'Smart Classroom Area', building_name: 'Smart Classroom Area', floor_or_landmark: 'Smart Classroom Common Area', latitude: 10.8278, longitude: 77.0200 },

      // 5. Administrative / Office Area
      { location_id: 15, zone_name: 'Administrative / Office Area', building_name: 'Administrative / Office Area', floor_or_landmark: 'Administrative Office', latitude: 10.8258, longitude: 77.0190 },
      { location_id: 16, zone_name: 'Administrative / Office Area', building_name: 'Administrative / Office Area', floor_or_landmark: 'Principal / Administration Area', latitude: 10.8259, longitude: 77.0191 },
      { location_id: 17, zone_name: 'Administrative / Office Area', building_name: 'Administrative / Office Area', floor_or_landmark: 'Office Common Area', latitude: 10.8257, longitude: 77.0189 },
      { location_id: 18, zone_name: 'Administrative / Office Area', building_name: 'Administrative / Office Area', floor_or_landmark: 'Controller of Examinations Office', latitude: 10.8256, longitude: 77.0188 },

      // 6. Conference Hall
      { location_id: 19, zone_name: 'Conference Hall', building_name: 'Conference Hall', floor_or_landmark: 'Conference Hall Entrance', latitude: 10.8262, longitude: 77.0210 },
      { location_id: 20, zone_name: 'Conference Hall', building_name: 'Conference Hall', floor_or_landmark: 'Conference Hall', latitude: 10.8263, longitude: 77.0211 },

      // 7. Guest Room & TV Hall
      { location_id: 21, zone_name: 'Guest Room & TV Hall', building_name: 'Guest Room & TV Hall', floor_or_landmark: 'Guest Room', latitude: 10.8254, longitude: 77.0215 },
      { location_id: 22, zone_name: 'Guest Room & TV Hall', building_name: 'Guest Room & TV Hall', floor_or_landmark: 'TV Hall', latitude: 10.8255, longitude: 77.0216 },

      // 8. Food Court & Amenity Center
      { location_id: 23, zone_name: 'Food Court & Amenity Center', building_name: 'Food Court & Amenity Center', floor_or_landmark: 'Food Court', latitude: 10.8272, longitude: 77.0210 },
      { location_id: 24, zone_name: 'Food Court & Amenity Center', building_name: 'Food Court & Amenity Center', floor_or_landmark: 'Amenity Center', latitude: 10.8273, longitude: 77.0211 },
      { location_id: 25, zone_name: 'Food Court & Amenity Center', building_name: 'Food Court & Amenity Center', floor_or_landmark: 'Food Court Entrance', latitude: 10.8274, longitude: 77.0212 },
      { location_id: 26, zone_name: 'Food Court & Amenity Center', building_name: 'Food Court & Amenity Center', floor_or_landmark: 'Food Waste Collection Area', latitude: 10.8275, longitude: 77.0213 },

      // 9. Hostel Area
      { location_id: 27, zone_name: 'Hostel Area', building_name: 'Hostel Area', floor_or_landmark: 'Hostel Entrance', latitude: 10.8295, longitude: 77.0180 },
      { location_id: 28, zone_name: 'Hostel Area', building_name: 'Hostel Area', floor_or_landmark: 'Hostel Common Area', latitude: 10.8296, longitude: 77.0181 },
      { location_id: 29, zone_name: 'Hostel Area', building_name: 'Hostel Area', floor_or_landmark: 'Hostel Dining Area', latitude: 10.8297, longitude: 77.0182 },
      { location_id: 30, zone_name: 'Hostel Area', building_name: 'Hostel Area', floor_or_landmark: 'Hostel Waste Collection Area', latitude: 10.8298, longitude: 77.0183 },

      // 10. Sports Area
      { location_id: 31, zone_name: 'Sports Area', building_name: 'Sports Area', floor_or_landmark: 'Sports Ground', latitude: 10.8280, longitude: 77.0235 },
      { location_id: 32, zone_name: 'Sports Area', building_name: 'Sports Area', floor_or_landmark: 'Sports Facilities', latitude: 10.8281, longitude: 77.0236 },
      { location_id: 33, zone_name: 'Sports Area', building_name: 'Sports Area', floor_or_landmark: 'Sports Common Area', latitude: 10.8282, longitude: 77.0237 },

      // 11. Fitness Centre
      { location_id: 34, zone_name: 'Fitness Centre', building_name: 'Fitness Centre', floor_or_landmark: 'Fitness Centre Entrance', latitude: 10.8285, longitude: 77.0238 },
      { location_id: 35, zone_name: 'Fitness Centre', building_name: 'Fitness Centre', floor_or_landmark: 'Fitness Centre', latitude: 10.8286, longitude: 77.0239 },

      // 12. Transport Area
      { location_id: 36, zone_name: 'Transport Area', building_name: 'Transport Area', floor_or_landmark: 'College Bus Area', latitude: 10.8248, longitude: 77.0175 },
      { location_id: 37, zone_name: 'Transport Area', building_name: 'Transport Area', floor_or_landmark: 'Bus Parking Area', latitude: 10.8249, longitude: 77.0176 },
      { location_id: 38, zone_name: 'Transport Area', building_name: 'Transport Area', floor_or_landmark: 'Transport Area', latitude: 10.8247, longitude: 77.0174 },

      // 13. Main Entrance
      { location_id: 39, zone_name: 'Main Entrance', building_name: 'Main Entrance', floor_or_landmark: 'Main Gate', latitude: 10.8250, longitude: 77.0180 },
      { location_id: 40, zone_name: 'Main Entrance', building_name: 'Main Entrance', floor_or_landmark: 'Entrance Road', latitude: 10.8251, longitude: 77.0181 },
      { location_id: 41, zone_name: 'Main Entrance', building_name: 'Main Entrance', floor_or_landmark: 'Security Area', latitude: 10.8252, longitude: 77.0182 },
      { location_id: 42, zone_name: 'Main Entrance', building_name: 'Main Entrance', floor_or_landmark: 'Visitor Area', latitude: 10.8253, longitude: 77.0183 },

      // 14. Campus Internal Area
      { location_id: 43, zone_name: 'Campus Internal Area', building_name: 'Campus Internal Area', floor_or_landmark: 'Internal Road', latitude: 10.8260, longitude: 77.0198 },
      { location_id: 44, zone_name: 'Campus Internal Area', building_name: 'Campus Internal Area', floor_or_landmark: 'Walkway', latitude: 10.8261, longitude: 77.0199 },
      { location_id: 45, zone_name: 'Campus Internal Area', building_name: 'Campus Internal Area', floor_or_landmark: 'Common Campus Area', latitude: 10.8262, longitude: 77.0200 },

      // 15. Green Campus Area
      { location_id: 46, zone_name: 'Green Campus Area', building_name: 'Green Campus Area', floor_or_landmark: 'Garden Area', latitude: 10.8242, longitude: 77.0212 },
      { location_id: 47, zone_name: 'Green Campus Area', building_name: 'Green Campus Area', floor_or_landmark: 'Green Campus Area', latitude: 10.8243, longitude: 77.0213 },
      { location_id: 48, zone_name: 'Green Campus Area', building_name: 'Green Campus Area', floor_or_landmark: 'Open Campus Area', latitude: 10.8244, longitude: 77.0214 },

      // 16. Student Activity Area
      { location_id: 49, zone_name: 'Student Activity Area', building_name: 'Student Activity Area', floor_or_landmark: 'Student Activity Area', latitude: 10.8276, longitude: 77.0225 },
      { location_id: 50, zone_name: 'Student Activity Area', building_name: 'Student Activity Area', floor_or_landmark: 'Club / Activity Area', latitude: 10.8277, longitude: 77.0226 },
      { location_id: 51, zone_name: 'Student Activity Area', building_name: 'Student Activity Area', floor_or_landmark: 'Event Area', latitude: 10.8278, longitude: 77.0227 },

      // 17. Waste Collection Area
      { location_id: 52, zone_name: 'Waste Collection Area', building_name: 'Waste Collection Area', floor_or_landmark: 'Main Waste Collection Point', latitude: 10.8245, longitude: 77.0220 },
      { location_id: 53, zone_name: 'Waste Collection Area', building_name: 'Waste Collection Area', floor_or_landmark: 'Segregated Waste Collection Area', latitude: 10.8246, longitude: 77.0221 },
      { location_id: 54, zone_name: 'Waste Collection Area', building_name: 'Waste Collection Area', floor_or_landmark: 'Waste Storage Area', latitude: 10.8247, longitude: 77.0222 },

      // 18. Other Campus Area
      { location_id: 55, zone_name: 'Other Campus Area', building_name: 'Other Campus Area', floor_or_landmark: 'Other Location', latitude: 10.8240, longitude: 77.0210 }
    ];

    // 3. Users (Admin, 4 Cleaning Staff, 4 Students)
    this.users = [
      { user_id: 1, full_name: 'Campus Chief Administrator', email: 'admin@acetcbe.edu.in', password_hash: adminHash, role: 'ADMIN', phone_number: '9876543210', is_active: 1,
        is_email_verified: 1, created_at: new Date('2026-01-01T08:00:00Z') },
      { user_id: 2, full_name: 'Ramesh Kumar (Cleaning Crew)', email: 'ramesh.staff@acetcbe.edu.in', password_hash: staffHash, role: 'STAFF', phone_number: '9876543211', is_active: 1,
        is_email_verified: 1, created_at: new Date('2026-01-02T08:00:00Z') },
      { user_id: 3, full_name: 'Priya Sharma (Student)', email: 'priya.student@acetcbe.edu.in', password_hash: passwordHash, role: 'STUDENT', phone_number: '9876543221', is_active: 1,
        is_email_verified: 1, created_at: new Date('2026-01-03T08:00:00Z') },
      { user_id: 4, full_name: 'Sunita Devi (Cleaning Crew)', email: 'sunita.staff@acetcbe.edu.in', password_hash: staffHash, role: 'STAFF', phone_number: '9876543212', is_active: 1,
        is_email_verified: 1, created_at: new Date('2026-01-04T08:00:00Z') },
      { user_id: 5, full_name: 'Manoj Patel (Cleaning Crew)', email: 'manoj.staff@acetcbe.edu.in', password_hash: staffHash, role: 'STAFF', phone_number: '9876543213', is_active: 1,
        is_email_verified: 1, created_at: new Date('2026-01-05T08:00:00Z') },
      { user_id: 6, full_name: 'Kavitha Murugan (Cleaning Crew)', email: 'kavitha.staff@acetcbe.edu.in', password_hash: staffHash, role: 'STAFF', phone_number: '9876543214', is_active: 1,
        is_email_verified: 1, created_at: new Date('2026-01-06T08:00:00Z') },
      { user_id: 7, full_name: 'Rohit Verma (Student)', email: 'rohit.student@acetcbe.edu.in', password_hash: passwordHash, role: 'STUDENT', phone_number: '9876543222', is_active: 1,
        is_email_verified: 1, created_at: new Date('2026-01-07T08:00:00Z') },
      { user_id: 8, full_name: 'Ananya Iyer (Student)', email: 'ananya.student@acetcbe.edu.in', password_hash: passwordHash, role: 'STUDENT', phone_number: '9876543223', is_active: 1,
        is_email_verified: 1, created_at: new Date('2026-01-08T08:00:00Z') },
      { user_id: 9, full_name: 'Karthik Rao (Student)', email: 'karthik.student@acetcbe.edu.in', password_hash: passwordHash, role: 'STUDENT', phone_number: '9876543224', is_active: 1,
        is_email_verified: 1, created_at: new Date('2026-01-09T08:00:00Z') }
    ];

    // 4. Cleaning Staff Profiles
    this.cleaning_staff = [
      { staff_id: 1, user_id: 2, employee_code: 'STF-2026-01', assigned_zone: 'Academic Area', shift_timing: 'MORNING', is_available: 1, created_at: new Date('2026-01-02T08:00:00Z') },
      { staff_id: 2, user_id: 4, employee_code: 'STF-2026-02', assigned_zone: 'Food Court & Amenity Center', shift_timing: 'AFTERNOON', is_available: 1, created_at: new Date('2026-01-04T08:00:00Z') },
      { staff_id: 3, user_id: 5, employee_code: 'STF-2026-03', assigned_zone: 'Hostel Area', shift_timing: 'MORNING', is_available: 1, created_at: new Date('2026-01-05T08:00:00Z') },
      { staff_id: 4, user_id: 6, employee_code: 'STF-2026-04', assigned_zone: 'Laboratory Area', shift_timing: 'EVENING', is_available: 1, created_at: new Date('2026-01-06T08:00:00Z') }
    ];

    const now = Date.now();
    // 5. Waste Reports (12 balanced across statuses)
    this.waste_reports = [
      // REPORTED (Pending Dispatch)
      { report_id: 1, ticket_code: 'CWMS-2026-91823', reporter_id: 3, location_id: 3, category_id: 1, description: 'Cardboard boxes, shipping cartons and plastic water bottles left near academic corridor.', priority: 'MEDIUM', status: 'REPORTED', created_at: new Date(now - 45 * 60000), updated_at: new Date(now - 45 * 60000) },
      { report_id: 2, ticket_code: 'CWMS-2026-72419', reporter_id: 7, location_id: 10, category_id: 4, description: 'Chemical reagent residue and glassware in engineering laboratory area.', priority: 'CRITICAL', status: 'REPORTED', created_at: new Date(now - 60 * 60000), updated_at: new Date(now - 60 * 60000) },
      { report_id: 3, ticket_code: 'CWMS-2026-38104', reporter_id: 8, location_id: 33, category_id: 5, description: 'Mixed sports litter, empty energy drink cans and wrappers near sports common area.', priority: 'LOW', status: 'REPORTED', created_at: new Date(now - 120 * 60000), updated_at: new Date(now - 120 * 60000) },

      // ASSIGNED (Dispatched to Staff)
      { report_id: 4, ticket_code: 'CWMS-2026-10492', reporter_id: 3, location_id: 26, category_id: 2, description: 'Food waste collection bin overflowing with discarded lunch plates and food scrap.', priority: 'HIGH', status: 'ASSIGNED', created_at: new Date(now - 180 * 60000), updated_at: new Date(now - 120 * 60000) },
      { report_id: 5, ticket_code: 'CWMS-2026-64210', reporter_id: 9, location_id: 30, category_id: 1, description: 'Plastic packaging and discarded cardboard delivery boxes piled at hostel waste collection area.', priority: 'MEDIUM', status: 'ASSIGNED', created_at: new Date(now - 240 * 60000), updated_at: new Date(now - 180 * 60000) },

      // IN_PROGRESS (Staff on site)
      { report_id: 6, ticket_code: 'CWMS-2026-84910', reporter_id: 7, location_id: 9, category_id: 3, description: 'Bundles of discarded computer peripheral wires and damaged keyboards in computer laboratory.', priority: 'HIGH', status: 'IN_PROGRESS', created_at: new Date(now - 300 * 60000), updated_at: new Date(now - 60 * 60000) },
      { report_id: 7, ticket_code: 'CWMS-2026-29174', reporter_id: 8, location_id: 10, category_id: 5, description: 'Metal shavings, packing rags, and mixed scrap litter in engineering laboratory.', priority: 'MEDIUM', status: 'IN_PROGRESS', created_at: new Date(now - 360 * 60000), updated_at: new Date(now - 60 * 60000) },

      // RESOLVED (Completed with before/after photos & logs)
      { report_id: 8, ticket_code: 'CWMS-2026-55201', reporter_id: 3, location_id: 6, category_id: 1, description: 'Library reading area paper bins cleared, shredded exam papers and printouts sorted.', priority: 'LOW', status: 'RESOLVED', created_at: new Date(now - 24 * 3600000), updated_at: new Date(now - 23 * 3600000) },
      { report_id: 9, ticket_code: 'CWMS-2026-44192', reporter_id: 7, location_id: 23, category_id: 2, description: 'Food court wet waste bins cleared before dinner service surge.', priority: 'HIGH', status: 'RESOLVED', created_at: new Date(now - 48 * 3600000), updated_at: new Date(now - 46 * 3600000) },
      { report_id: 10, ticket_code: 'CWMS-2026-33918', reporter_id: 8, location_id: 28, category_id: 2, description: 'Hostel common area garden compost foliage, lawn trimmings and organic fruit peels.', priority: 'LOW', status: 'RESOLVED', created_at: new Date(now - 72 * 3600000), updated_at: new Date(now - 70 * 3600000) },
      { report_id: 11, ticket_code: 'CWMS-2026-21849', reporter_id: 9, location_id: 9, category_id: 3, description: 'Obsolete networking cables and discarded monitor parts safely cleared from computer laboratory.', priority: 'HIGH', status: 'RESOLVED', created_at: new Date(now - 96 * 3600000), updated_at: new Date(now - 94 * 3600000) },
      { report_id: 12, ticket_code: 'CWMS-2026-11029', reporter_id: 3, location_id: 10, category_id: 4, description: 'Chemical spill neutralized with sodium bicarbonate and container safely stored.', priority: 'CRITICAL', status: 'RESOLVED', created_at: new Date(now - 120 * 3600000), updated_at: new Date(now - 118 * 3600000) }
    ];

    // 6. Before and After Images
    this.before_after_images = [
      { image_id: 1, report_id: 1, uploaded_by: 3, image_type: 'BEFORE', image_url: '/uploads/reports/sample-cartons.jpg', file_size_kb: 380, uploaded_at: new Date(now - 45 * 60000) },
      { image_id: 2, report_id: 2, uploaded_by: 7, image_type: 'BEFORE', image_url: '/uploads/reports/sample-chemical.jpg', file_size_kb: 420, uploaded_at: new Date(now - 60 * 60000) },
      { image_id: 3, report_id: 3, uploaded_by: 8, image_type: 'BEFORE', image_url: '/uploads/reports/sample-sports.jpg', file_size_kb: 290, uploaded_at: new Date(now - 120 * 60000) },
      { image_id: 4, report_id: 4, uploaded_by: 3, image_type: 'BEFORE', image_url: '/uploads/reports/sample-cafeteria.jpg', file_size_kb: 450, uploaded_at: new Date(now - 180 * 60000) },
      { image_id: 5, report_id: 5, uploaded_by: 9, image_type: 'BEFORE', image_url: '/uploads/reports/sample-hostel.jpg', file_size_kb: 360, uploaded_at: new Date(now - 240 * 60000) },
      { image_id: 6, report_id: 6, uploaded_by: 7, image_type: 'BEFORE', image_url: '/uploads/reports/sample-ewaste.jpg', file_size_kb: 410, uploaded_at: new Date(now - 300 * 60000) },
      { image_id: 7, report_id: 7, uploaded_by: 8, image_type: 'BEFORE', image_url: '/uploads/reports/sample-workshop.jpg', file_size_kb: 390, uploaded_at: new Date(now - 360 * 60000) },
      { image_id: 8, report_id: 8, uploaded_by: 3, image_type: 'BEFORE', image_url: '/uploads/reports/sample-library.jpg', file_size_kb: 310, uploaded_at: new Date(now - 24 * 3600000) },
      { image_id: 9, report_id: 8, uploaded_by: 2, image_type: 'AFTER', image_url: '/uploads/resolutions/sample-library-clean.jpg', file_size_kb: 290, uploaded_at: new Date(now - 23 * 3600000) },
      { image_id: 10, report_id: 9, uploaded_by: 7, image_type: 'BEFORE', image_url: '/uploads/reports/sample-foodcourt.jpg', file_size_kb: 430, uploaded_at: new Date(now - 48 * 3600000) },
      { image_id: 11, report_id: 9, uploaded_by: 4, image_type: 'AFTER', image_url: '/uploads/resolutions/sample-foodcourt-clean.jpg', file_size_kb: 340, uploaded_at: new Date(now - 46 * 3600000) },
      { image_id: 12, report_id: 10, uploaded_by: 8, image_type: 'BEFORE', image_url: '/uploads/reports/sample-garden.jpg', file_size_kb: 350, uploaded_at: new Date(now - 72 * 3600000) },
      { image_id: 13, report_id: 10, uploaded_by: 5, image_type: 'AFTER', image_url: '/uploads/resolutions/sample-garden-clean.jpg', file_size_kb: 310, uploaded_at: new Date(now - 70 * 3600000) },
      { image_id: 14, report_id: 11, uploaded_by: 9, image_type: 'BEFORE', image_url: '/uploads/reports/sample-cables.jpg', file_size_kb: 480, uploaded_at: new Date(now - 96 * 3600000) },
      { image_id: 15, report_id: 11, uploaded_by: 2, image_type: 'AFTER', image_url: '/uploads/resolutions/sample-cables-clean.jpg', file_size_kb: 380, uploaded_at: new Date(now - 94 * 3600000) },
      { image_id: 16, report_id: 12, uploaded_by: 3, image_type: 'BEFORE', image_url: '/uploads/reports/sample-hazard.jpg', file_size_kb: 510, uploaded_at: new Date(now - 120 * 3600000) },
      { image_id: 17, report_id: 12, uploaded_by: 2, image_type: 'AFTER', image_url: '/uploads/resolutions/sample-hazard-clean.jpg', file_size_kb: 430, uploaded_at: new Date(now - 118 * 3600000) }
    ];

    // 7. Assignments
    this.assignments = [
      { assignment_id: 1, report_id: 4, staff_id: 2, assigned_by: 1, assignment_status: 'ASSIGNED', assigned_at: new Date(now - 120 * 60000), acknowledged_at: null, admin_notes: 'Clear cafeteria patio bins before afternoon dining crowd.' },
      { assignment_id: 2, report_id: 5, staff_id: 3, assigned_by: 1, assignment_status: 'ASSIGNED', assigned_at: new Date(now - 180 * 60000), acknowledged_at: null, admin_notes: 'Coordinate with hostel warden for recycling collection.' },
      { assignment_id: 3, report_id: 6, staff_id: 1, assigned_by: 1, assignment_status: 'IN_PROGRESS', assigned_at: new Date(now - 240 * 60000), acknowledged_at: new Date(now - 180 * 60000), admin_notes: 'High priority e-waste collection from Computer Lab 2 corridor.' },
      { assignment_id: 4, report_id: 7, staff_id: 4, assigned_by: 1, assignment_status: 'IN_PROGRESS', assigned_at: new Date(now - 300 * 60000), acknowledged_at: new Date(now - 240 * 60000), admin_notes: 'Ensure safety goggles worn when handling workshop metal debris.' },
      { assignment_id: 5, report_id: 8, staff_id: 1, assigned_by: 1, assignment_status: 'COMPLETED', assigned_at: new Date(now - 24 * 3600000), acknowledged_at: new Date(now - 23.5 * 3600000), admin_notes: 'Routine library morning round.' },
      { assignment_id: 6, report_id: 9, staff_id: 2, assigned_by: 1, assignment_status: 'COMPLETED', assigned_at: new Date(now - 48 * 3600000), acknowledged_at: new Date(now - 47.25 * 3600000), admin_notes: 'Cafeteria shift handover clean.' },
      { assignment_id: 7, report_id: 10, staff_id: 3, assigned_by: 1, assignment_status: 'COMPLETED', assigned_at: new Date(now - 72 * 3600000), acknowledged_at: new Date(now - 71 * 3600000), admin_notes: 'Hostel courtyard maintenance.' },
      { assignment_id: 8, report_id: 11, staff_id: 1, assigned_by: 1, assignment_status: 'COMPLETED', assigned_at: new Date(now - 96 * 3600000), acknowledged_at: new Date(now - 95 * 3600000), admin_notes: 'Transfer e-waste to Central Secure Storage.' },
      { assignment_id: 9, report_id: 12, staff_id: 1, assigned_by: 1, assignment_status: 'COMPLETED', assigned_at: new Date(now - 120 * 3600000), acknowledged_at: new Date(now - 119 * 3600000), admin_notes: 'Specialized PPE protocol required for acid neutralization.' }
    ];

    // 8. Waste Collection
    this.waste_collection = [
      { collection_id: 1, assignment_id: 5, report_id: 8, staff_id: 1, collection_time: new Date(now - 23 * 3600000), waste_weight_kg: 8.5, disposal_destination: 'Campus Paper Recycling Unit', remarks: 'Sorted into dry paper baler; clean condition.' },
      { collection_id: 2, assignment_id: 6, report_id: 9, staff_id: 2, collection_time: new Date(now - 46 * 3600000), waste_weight_kg: 14.2, disposal_destination: 'Campus Biomass Composting Facility', remarks: 'Transferred to organic aerobic compost pit #2.' },
      { collection_id: 3, assignment_id: 7, report_id: 10, staff_id: 3, collection_time: new Date(now - 70 * 3600000), waste_weight_kg: 6.8, disposal_destination: 'Campus Biomass Composting Facility', remarks: 'Garden leaf foliage composted.' },
      { collection_id: 4, assignment_id: 8, report_id: 11, staff_id: 1, collection_time: new Date(now - 94 * 3600000), waste_weight_kg: 11.4, disposal_destination: 'Authorized District E-Waste Recycler', remarks: 'Logged with serial numbers; safely stacked.' },
      { collection_id: 5, assignment_id: 9, report_id: 12, staff_id: 1, collection_time: new Date(now - 118 * 3600000), waste_weight_kg: 3.2, disposal_destination: 'Hazardous Chemical Containment Storage', remarks: 'Neutralized residue placed in double-walled secondary drum.' }
    ];

    // 9. Notifications
    this.notifications = [
      { notification_id: 1, recipient_id: 1, report_id: 1, title: 'New Waste Incident Filed', message: 'Ticket #CWMS-2026-91823 reported at Academic Area (MEDIUM priority).', notification_type: 'REPORT_FILED', is_read: 0, created_at: new Date(now - 45 * 60000) },
      { notification_id: 2, recipient_id: 1, report_id: 2, title: 'Critical Chemical Incident Alert', message: 'EMERGENCY: Ticket #CWMS-2026-72419 reported at Engineering Laboratory (CRITICAL priority). Immediate dispatch required.', notification_type: 'STATUS_UPDATE', is_read: 0, created_at: new Date(now - 60 * 60000) },
      { notification_id: 3, recipient_id: 1, report_id: 3, title: 'New Waste Incident Filed', message: 'Ticket #CWMS-2026-38104 reported at Fitness Centre (LOW priority).', notification_type: 'REPORT_FILED', is_read: 1, created_at: new Date(now - 120 * 60000) },
      { notification_id: 4, recipient_id: 2, report_id: 4, title: 'Cleaning Task Dispatched', message: 'You have been assigned to Ticket #CWMS-2026-10492 at Food Court (HIGH priority).', notification_type: 'TASK_ASSIGNED', is_read: 0, created_at: new Date(now - 120 * 60000) },
      { notification_id: 5, recipient_id: 3, report_id: 4, title: 'Task Assigned to Staff', message: 'Your report #CWMS-2026-10492 has been assigned to Ramesh Kumar (Cleaning Crew).', notification_type: 'STATUS_UPDATE', is_read: 0, created_at: new Date(now - 120 * 60000) },
      { notification_id: 6, recipient_id: 1, report_id: 6, title: 'Task In Progress', message: 'Staff member Ramesh Kumar started cleanup on Ticket #CWMS-2026-84910 at Computer Laboratory.', notification_type: 'STATUS_UPDATE', is_read: 1, created_at: new Date(now - 60 * 60000) },
      { notification_id: 7, recipient_id: 3, report_id: 8, title: 'Waste Cleared & Verified!', message: 'Your reported waste incident #CWMS-2026-55201 at Central Library has been cleaned with photo proof.', notification_type: 'STATUS_UPDATE', is_read: 1, created_at: new Date(now - 23 * 3600000) },
      { notification_id: 8, recipient_id: 7, report_id: 9, title: 'Waste Cleared & Verified!', message: 'Your reported waste incident #CWMS-2026-44192 at Food Court has been cleaned with photo proof.', notification_type: 'STATUS_UPDATE', is_read: 1, created_at: new Date(now - 46 * 3600000) },
      { notification_id: 9, recipient_id: 8, report_id: 10, title: 'Waste Cleared & Verified!', message: 'Your reported waste incident #CWMS-2026-33918 at Green Campus Area has been cleaned with photo proof.', notification_type: 'STATUS_UPDATE', is_read: 1, created_at: new Date(now - 70 * 3600000) },
      { notification_id: 10, recipient_id: 1, report_id: 8, title: 'Cleanup Verified by Staff', message: 'Ticket #CWMS-2026-55201 resolved by Ramesh Kumar (8.5 kg collected).', notification_type: 'STATUS_UPDATE', is_read: 1, created_at: new Date(now - 23 * 3600000) }
    ];

    this.autoIds = {
      user_id: 10,
      staff_id: 5,
      report_id: 13,
      image_id: 18,
      assignment_id: 10,
      collection_id: 6,
      notification_id: 11
    };

    return {
      success: true,
      message: 'Realistic demo dataset populated successfully.',
      reportsCount: this.waste_reports.length,
      usersCount: this.users.length,
      staffCount: this.cleaning_staff.length,
      locationsCount: this.locations.length
    };
  }

  // Generic query processor matching model SQL queries
  async query(sql, params = []) {
    const cleanSql = sql.trim().replace(/\s+/g, ' ');

    // 0. DDL & Setup queries
    if (/CREATE TABLE/i.test(cleanSql)) {
      return [{ affectedRows: 0 }];
    }

    // 1. Users queries
    if (/SELECT .* FROM users WHERE (LOWER\(email\)|email) = \?/i.test(cleanSql)) {
      const email = params[0];
      const user = this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      return [user ? [user] : []];
    }
    if (/SELECT .* FROM users WHERE user_id = \?/i.test(cleanSql)) {
      const id = parseInt(params[0], 10);
      const user = this.users.find(u => u.user_id === id);
      return [user ? [user] : []];
    }
    if (/UPDATE users SET is_email_verified = 1 WHERE user_id = \?/i.test(cleanSql)) {
      const uid = parseInt(params[0], 10);
      const user = this.users.find(u => u.user_id === uid);
      if (user) user.is_email_verified = 1;
      return [{ affectedRows: user ? 1 : 0 }];
    }
    if (/INSERT INTO users/i.test(cleanSql)) {
      const [fullName, email, passwordHash, role, phoneNumber] = params;
      const user_id = this.autoIds.user_id++;
      const newUser = {
        user_id,
        full_name: fullName,
        email,
        password_hash: passwordHash,
        role,
        phone_number: phoneNumber || null,
        is_active: 1,
        is_email_verified: 1,
        created_at: new Date()
      };
      this.users.push(newUser);
      return [{ insertId: user_id, affectedRows: 1 }];
    }
    if (/SELECT .* FROM users WHERE role = 'ADMIN'/i.test(cleanSql)) {
      const admins = this.users.filter(u => u.role === 'ADMIN' && u.is_active);
      return [admins];
    }
    if (/SELECT user_id, full_name, email, role, phone_number, is_active, created_at FROM users/i.test(cleanSql)) {
      let result = [...this.users];
      if (params[0]) {
        result = result.filter(u => u.role === params[0]);
      }
      return [result];
    }

    
    // isStaffAuthorized query handler
    if (/users u LEFT JOIN cleaning_staff s/i.test(cleanSql)) {
      const emailParam = (params[0] || '').toLowerCase();
      const u = this.users.find(usr => usr.email.toLowerCase() === emailParam);
      if (!u || !['STAFF', 'ADMIN'].includes(u.role)) {
        return [[]];
      }
      const s = this.cleaning_staff.find(st => st.user_id === u.user_id) || {};
      return [[{
        user_id: u.user_id,
        email: u.email,
        role: u.role,
        staff_id: s.staff_id || null,
        is_available: s.is_available ?? 1,
        assigned_zone: s.assigned_zone || 'General Campus'
      }]];
    }
    // isStaffAuthorizedQuery
// 2. Staff queries
    if (/SELECT .* FROM cleaning_staff s JOIN users u .* s\.user_id = \?/i.test(cleanSql)) {
      const uid = parseInt(params[0], 10);
      const s = this.cleaning_staff.find(st => st.user_id === uid);
      if (!s) return [[]];
      const u = this.users.find(usr => usr.user_id === s.user_id) || {};
      return [[{ ...s, full_name: u.full_name, email: u.email, phone_number: u.phone_number }]];
    }
    if (/SELECT .* FROM cleaning_staff s JOIN users u .* s\.staff_id = \?/i.test(cleanSql)) {
      const sid = parseInt(params[0], 10);
      const s = this.cleaning_staff.find(st => st.staff_id === sid);
      if (!s) return [[]];
      const u = this.users.find(usr => usr.user_id === s.user_id) || {};
      return [[{ ...s, full_name: u.full_name, email: u.email, phone_number: u.phone_number }]];
    }
    if (/INSERT INTO cleaning_staff/i.test(cleanSql)) {
      const [userId, employeeCode, assignedZone, shiftTiming] = params;
      const staff_id = this.autoIds.staff_id++;
      const newStaff = {
        staff_id,
        user_id: parseInt(userId, 10),
        employee_code: employeeCode,
        assigned_zone: assignedZone || 'General Campus',
        shift_timing: shiftTiming || 'MORNING',
        is_available: 1,
        created_at: new Date()
      };
      this.cleaning_staff.push(newStaff);
      return [{ insertId: staff_id, affectedRows: 1 }];
    }
    if (/UPDATE cleaning_staff SET is_available = \? WHERE staff_id = \?/i.test(cleanSql)) {
      const [isAvail, sid] = params;
      const s = this.cleaning_staff.find(st => st.staff_id === parseInt(sid, 10));
      if (s) s.is_available = isAvail ? 1 : 0;
      return [{ affectedRows: s ? 1 : 0 }];
    }

    // 3. Locations and Categories
    if (/SELECT .* FROM locations ORDER/i.test(cleanSql)) {
      return [this.locations];
    }
    if (/SELECT DISTINCT zone_name FROM locations/i.test(cleanSql)) {
      const zones = Array.from(new Set(this.locations.map(l => l.zone_name))).map(z => ({ zone_name: z }));
      return [zones];
    }
    if (/SELECT .* FROM waste_categories/i.test(cleanSql) && !/JOIN/i.test(cleanSql)) {
      return [this.categories];
    }

    if (/SELECT location_id FROM locations WHERE location_id = \?/i.test(cleanSql)) {
      const exists = this.locations.some(l => l.location_id === parseInt(params[0], 10));
      return [exists ? [{ location_id: params[0] }] : []];
    }
    if (/SELECT category_id FROM waste_categories WHERE category_id = \?/i.test(cleanSql)) {
      const exists = this.categories.some(c => c.category_id === parseInt(params[0], 10));
      return [exists ? [{ category_id: params[0] }] : []];
    }

    // 4. Waste Reports
    if (/INSERT INTO waste_reports/i.test(cleanSql)) {
      const [ticketCode, reporterId, locationId, categoryId, description, priority] = params;
      const report_id = this.autoIds.report_id++;
      const newReport = {
        report_id,
        ticket_code: ticketCode,
        reporter_id: parseInt(reporterId, 10),
        location_id: parseInt(locationId, 10),
        category_id: parseInt(categoryId, 10),
        description,
        priority: priority || 'MEDIUM',
        status: 'REPORTED',
        created_at: new Date(),
        updated_at: new Date()
      };
      this.waste_reports.push(newReport);
      return [{ insertId: report_id, affectedRows: 1 }];
    }
    if (/INSERT INTO before_after_images/i.test(cleanSql)) {
      let reportId, uploadedBy, imageType, imageUrl, fileSizeKb;
      if (cleanSql.includes('(SELECT user_id FROM cleaning_staff')) {
        // [reportId, staffId, afterImageUrl, fileSizeKb]
        const [rId, sId, imgUrl, sizeKb] = params;
        reportId = rId;
        const staff = this.cleaning_staff.find(st => st.staff_id === parseInt(sId, 10));
        uploadedBy = staff ? staff.user_id : 1;
        imageType = 'AFTER';
        imageUrl = imgUrl;
        fileSizeKb = sizeKb;
      } else {
        [reportId, uploadedBy, imageType, imageUrl, fileSizeKb] = params;
      }
      const image_id = this.autoIds.image_id++;
      const newImg = {
        image_id,
        report_id: parseInt(reportId, 10),
        uploaded_by: parseInt(uploadedBy, 10),
        image_type: imageType,
        image_url: imageUrl,
        file_size_kb: fileSizeKb || null,
        uploaded_at: new Date()
      };
      this.before_after_images.push(newImg);
      return [{ insertId: image_id, affectedRows: 1 }];
    }
    if (/SELECT .* FROM before_after_images WHERE report_id = \?/i.test(cleanSql)) {
      const rid = parseInt(params[0], 10);
      const imgs = this.before_after_images.filter(img => img.report_id === rid);
      return [imgs];
    }
    if (/SELECT .* FROM waste_reports r .* WHERE r\.report_id = \? LIMIT 1/i.test(cleanSql)) {
      const rid = parseInt(params[0], 10);
      const r = this.waste_reports.find(rep => rep.report_id === rid);
      if (!r) return [[]];
      const u = this.users.find(usr => usr.user_id === r.reporter_id) || {};
      const l = this.locations.find(loc => loc.location_id === r.location_id) || {};
      const c = this.categories.find(cat => cat.category_id === r.category_id) || {};
      const beforeImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'BEFORE');
      const afterImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'AFTER');
      const repImages = this.before_after_images.filter(img => img.report_id === r.report_id);
      return [[{
        report_id: r.report_id,
        ticket_code: r.ticket_code,
        description: r.description,
        priority: r.priority,
        status: r.status,
        created_at: r.created_at,
        updated_at: r.updated_at,
        reporter_id: u.user_id,
        reporter_name: u.full_name,
        reporter_email: u.email,
        location_id: l.location_id,
        zone_name: l.zone_name,
        building_name: l.building_name,
        floor_or_landmark: l.floor_or_landmark,
        latitude: l.latitude,
        longitude: l.longitude,
        category_id: c.category_id,
        category_name: c.category_name,
        color_code: c.color_code,
        is_hazardous: c.is_hazardous,
        before_image: beforeImg ? beforeImg.image_url : null,
        after_image: afterImg ? afterImg.image_url : null,
        images: repImages
      }]];
    }
    if (/SELECT .* FROM waste_reports r .* WHERE r\.reporter_id = \?/i.test(cleanSql)) {
      const uid = parseInt(params[0], 10);
      const reports = this.waste_reports
        .filter(r => r.reporter_id === uid)
        .map(r => {
          const l = this.locations.find(loc => loc.location_id === r.location_id) || {};
          const c = this.categories.find(cat => cat.category_id === r.category_id) || {};
          const beforeImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'BEFORE');
          const afterImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'AFTER');
          return {
            report_id: r.report_id,
            ticket_code: r.ticket_code,
            description: r.description,
            priority: r.priority,
            status: r.status,
            created_at: r.created_at,
            updated_at: r.updated_at,
            zone_name: l.zone_name,
            building_name: l.building_name,
            floor_or_landmark: l.floor_or_landmark,
            latitude: l.latitude,
            longitude: l.longitude,
            category_name: c.category_name,
            color_code: c.color_code,
            before_image: beforeImg ? beforeImg.image_url : null,
            after_image: afterImg ? afterImg.image_url : null
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [reports];
    }
    if (/SELECT .* FROM waste_reports r .* WHERE 1=1/i.test(cleanSql)) {
      let filtered = [...this.waste_reports];
      let pIdx = 0;
      if (cleanSql.includes('r.status = ?')) {
        const st = params[pIdx++];
        filtered = filtered.filter(r => r.status === st);
      }
      if (cleanSql.includes('r.priority = ?')) {
        const pr = params[pIdx++];
        filtered = filtered.filter(r => r.priority === pr);
      }
      if (cleanSql.includes('l.zone_name = ?')) {
        const zn = params[pIdx++];
        filtered = filtered.filter(r => {
          const l = this.locations.find(loc => loc.location_id === r.location_id);
          return l && l.zone_name === zn;
        });
      }

      const rows = filtered
        .map(r => {
          const u = this.users.find(usr => usr.user_id === r.reporter_id) || {};
          const l = this.locations.find(loc => loc.location_id === r.location_id) || {};
          const c = this.categories.find(cat => cat.category_id === r.category_id) || {};
          const beforeImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'BEFORE');
          const afterImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'AFTER');
          return {
            report_id: r.report_id,
            ticket_code: r.ticket_code,
            description: r.description,
            priority: r.priority,
            status: r.status,
            created_at: r.created_at,
            updated_at: r.updated_at,
            reporter_name: u.full_name,
            reporter_email: u.email,
            zone_name: l.zone_name,
            building_name: l.building_name,
            floor_or_landmark: l.floor_or_landmark,
            latitude: l.latitude,
            longitude: l.longitude,
            category_name: c.category_name,
            color_code: c.color_code,
            before_image: beforeImg ? beforeImg.image_url : null,
            after_image: afterImg ? afterImg.image_url : null
          };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [rows];
    }
    if (/UPDATE waste_reports SET status = (?:'([^']+)'|\?) WHERE report_id = \?/i.test(cleanSql)) {
      const match = cleanSql.match(/UPDATE waste_reports SET status = (?:'([^']+)'|\?) WHERE report_id = \?/i);
      let status, rid;
      if (match && match[1]) {
        status = match[1];
        rid = params[0];
      } else {
        [status, rid] = params;
      }
      const r = this.waste_reports.find(rep => rep.report_id === parseInt(rid, 10));
      if (r) {
        r.status = status;
        r.updated_at = new Date();
      }
      return [{ affectedRows: r ? 1 : 0 }];
    }
    if (/UPDATE waste_reports SET status = 'IN_PROGRESS' WHERE report_id = \(SELECT report_id FROM assignments WHERE assignment_id = \?\)/i.test(cleanSql)) {
      const aid = parseInt(params[0], 10);
      const a = this.assignments.find(asn => asn.assignment_id === aid);
      if (a) {
        const r = this.waste_reports.find(rep => rep.report_id === a.report_id);
        if (r) {
          r.status = 'IN_PROGRESS';
          r.updated_at = new Date();
        }
      }
      return [{ affectedRows: 1 }];
    }
    if (/UPDATE waste_reports SET priority = \? WHERE report_id = \?/i.test(cleanSql)) {
      const [priority, rid] = params;
      const r = this.waste_reports.find(rep => rep.report_id === parseInt(rid, 10));
      if (r) {
        r.priority = priority;
        r.updated_at = new Date();
      }
      return [{ affectedRows: r ? 1 : 0 }];
    }
    if (/DELETE FROM waste_reports WHERE report_id = \?/i.test(cleanSql)) {
      const rid = parseInt(params[0], 10);
      const initialLen = this.waste_reports.length;
      this.waste_reports = this.waste_reports.filter(r => r.report_id !== rid);
      this.assignments = this.assignments.filter(a => a.report_id !== rid);
      this.before_after_images = this.before_after_images.filter(img => img.report_id !== rid);
      return [{ affectedRows: initialLen - this.waste_reports.length }];
    }

    // 5. Assignments
    if (/INSERT INTO assignments/i.test(cleanSql)) {
      const [reportId, staffId, assignedBy, adminNotes] = params;
      const assignment_id = this.autoIds.assignment_id++;
      const newAssign = {
        assignment_id,
        report_id: parseInt(reportId, 10),
        staff_id: parseInt(staffId, 10),
        assigned_by: parseInt(assignedBy, 10),
        assignment_status: 'ASSIGNED',
        assigned_at: new Date(),
        acknowledged_at: null,
        admin_notes: adminNotes || null
      };
      this.assignments.push(newAssign);
      const r = this.waste_reports.find(rep => rep.report_id === parseInt(reportId, 10));
      if (r) r.status = 'ASSIGNED';
      return [{ insertId: assignment_id, affectedRows: 1 }];
    }
    if (/SELECT .* FROM assignments a JOIN waste_reports r .* WHERE a\.staff_id = \?/i.test(cleanSql)) {
      const sid = parseInt(params[0], 10);
      const filtered = this.assignments.filter(a => a.staff_id === sid);
      const rows = filtered.map(a => {
        const r = this.waste_reports.find(rep => rep.report_id === a.report_id) || {};
        const l = this.locations.find(loc => loc.location_id === r.location_id) || {};
        const c = this.categories.find(cat => cat.category_id === r.category_id) || {};
        const beforeImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'BEFORE');
        const afterImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'AFTER');
        return {
          assignment_id: a.assignment_id,
          assignment_status: a.assignment_status,
          assigned_at: a.assigned_at,
          acknowledged_at: a.acknowledged_at,
          admin_notes: a.admin_notes,
          report_id: r.report_id,
          ticket_code: r.ticket_code,
          description: r.description,
          priority: r.priority,
          report_status: r.status,
          report_created_at: r.created_at,
          zone_name: l.zone_name,
          building_name: l.building_name,
          floor_or_landmark: l.floor_or_landmark,
          latitude: l.latitude,
          longitude: l.longitude,
          category_name: c.category_name,
          color_code: c.color_code,
          is_hazardous: c.is_hazardous,
          before_image: beforeImg ? beforeImg.image_url : null,
          after_image: afterImg ? afterImg.image_url : null
        };
      });
      return [rows];
    }
    if (/SELECT .* FROM assignments a JOIN waste_reports r .* WHERE a\.assignment_id = \?/i.test(cleanSql)) {
      const aid = parseInt(params[0], 10);
      const a = this.assignments.find(asn => asn.assignment_id === aid);
      if (!a) return [[]];
      const r = this.waste_reports.find(rep => rep.report_id === a.report_id) || {};
      const u = this.users.find(usr => usr.user_id === r.reporter_id) || {};
      const l = this.locations.find(loc => loc.location_id === r.location_id) || {};
      const c = this.categories.find(cat => cat.category_id === r.category_id) || {};
      const beforeImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'BEFORE');
      const afterImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'AFTER');
      return [[{
        assignment_id: a.assignment_id,
        report_id: a.report_id,
        staff_id: a.staff_id,
        assignment_status: a.assignment_status,
        assigned_at: a.assigned_at,
        acknowledged_at: a.acknowledged_at,
        admin_notes: a.admin_notes,
        ticket_code: r.ticket_code,
        reporter_id: r.reporter_id,
        description: r.description,
        priority: r.priority,
        report_status: r.status,
        report_created_at: r.created_at,
        reporter_name: u.full_name,
        reporter_phone: u.phone_number,
        zone_name: l.zone_name,
        building_name: l.building_name,
        floor_or_landmark: l.floor_or_landmark,
        latitude: l.latitude,
        longitude: l.longitude,
        category_name: c.category_name,
        color_code: c.color_code,
        is_hazardous: c.is_hazardous,
        before_image: beforeImg ? beforeImg.image_url : null,
        after_image: afterImg ? afterImg.image_url : null
      }]];
    }
    if (/UPDATE assignments SET assignment_status = 'ACKNOWLEDGED'/i.test(cleanSql)) {
      const [aid, sid] = params;
      const a = this.assignments.find(asn => asn.assignment_id === parseInt(aid, 10) && asn.staff_id === parseInt(sid, 10));
      if (a) {
        a.assignment_status = 'ACKNOWLEDGED';
        a.acknowledged_at = new Date();
      }
      return [{ affectedRows: a ? 1 : 0 }];
    }
    if (/UPDATE assignments SET assignment_status = 'IN_PROGRESS'/i.test(cleanSql)) {
      const [aid, sid] = params;
      const a = this.assignments.find(asn => asn.assignment_id === parseInt(aid, 10) && asn.staff_id === parseInt(sid, 10));
      if (a) {
        a.assignment_status = 'IN_PROGRESS';
        const r = this.waste_reports.find(rep => rep.report_id === a.report_id);
        if (r) r.status = 'IN_PROGRESS';
      }
      return [{ affectedRows: a ? 1 : 0 }];
    }
    if (/UPDATE assignments SET assignment_status = 'COMPLETED'/i.test(cleanSql)) {
      const [aid, sid] = params;
      const a = this.assignments.find(asn => asn.assignment_id === parseInt(aid, 10) && asn.staff_id === parseInt(sid, 10));
      if (a) {
        a.assignment_status = 'COMPLETED';
        const r = this.waste_reports.find(rep => rep.report_id === a.report_id);
        if (r) r.status = 'RESOLVED';
      }
      return [{ affectedRows: a ? 1 : 0 }];
    }
    if (/INSERT INTO waste_collection/i.test(cleanSql)) {
      const [aid, rId, sId, weight, dest, rem] = params;
      const collection_id = this.autoIds.collection_id++;
      const coll = {
        collection_id,
        assignment_id: parseInt(aid, 10),
        report_id: parseInt(rId, 10),
        staff_id: parseInt(sId, 10),
        collection_time: new Date(),
        waste_weight_kg: weight ? parseFloat(weight) : null,
        disposal_destination: dest || 'Campus Main Dumpster',
        remarks: rem || null
      };
      this.waste_collection.push(coll);
      return [{ insertId: collection_id, affectedRows: 1 }];
    }
    if (/SELECT .* FROM assignments a JOIN waste_collection wc .* WHERE a\.staff_id = \?/i.test(cleanSql)) {
      const sid = parseInt(params[0], 10);
      const completed = this.assignments.filter(a => a.staff_id === sid && a.assignment_status === 'COMPLETED');
      const rows = completed.map(a => {
        const wc = this.waste_collection.find(c => c.assignment_id === a.assignment_id) || {};
        const r = this.waste_reports.find(rep => rep.report_id === a.report_id) || {};
        const l = this.locations.find(loc => loc.location_id === r.location_id) || {};
        const c = this.categories.find(cat => cat.category_id === r.category_id) || {};
        const beforeImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'BEFORE');
        const afterImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'AFTER');
        return {
          assignment_id: a.assignment_id,
          assigned_at: a.assigned_at,
          collection_time: wc.collection_time || new Date(),
          waste_weight_kg: wc.waste_weight_kg,
          disposal_destination: wc.disposal_destination,
          staff_remarks: wc.remarks,
          report_id: r.report_id,
          ticket_code: r.ticket_code,
          description: r.description,
          priority: r.priority,
          zone_name: l.zone_name,
          building_name: l.building_name,
          floor_or_landmark: l.floor_or_landmark,
          category_name: c.category_name,
          color_code: c.color_code,
          before_image: beforeImg ? beforeImg.image_url : null,
          after_image: afterImg ? afterImg.image_url : null
        };
      });
      return [rows];
    }

    // 6. Notifications
    if (/INSERT INTO notifications/i.test(cleanSql)) {
      if (Array.isArray(params[0])) {
        // Bulk insert for admins
        params[0].forEach(p => {
          this.notifications.push({
            notification_id: this.autoIds.notification_id++,
            recipient_id: p[0],
            report_id: p[1],
            title: p[2],
            message: p[3],
            notification_type: p[4],
            is_read: 0,
            created_at: new Date()
          });
        });
        return [{ affectedRows: params[0].length }];
      } else {
        const [recipientId, reportId, title, message, type] = params;
        const nid = this.autoIds.notification_id++;
        this.notifications.push({
          notification_id: nid,
          recipient_id: parseInt(recipientId, 10),
          report_id: reportId ? parseInt(reportId, 10) : null,
          title,
          message,
          notification_type: type || 'STATUS_UPDATE',
          is_read: 0,
          created_at: new Date()
        });
        return [{ insertId: nid, affectedRows: 1 }];
      }
    }
    if (/SELECT .* FROM notifications n .* WHERE n\.recipient_id = \?/i.test(cleanSql)) {
      const uid = parseInt(params[0], 10);
      const notifs = this.notifications
        .filter(n => n.recipient_id === uid)
        .map(n => {
          const r = this.waste_reports.find(rep => rep.report_id === n.report_id);
          return { ...n, ticket_code: r ? r.ticket_code : null };
        })
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [notifs];
    }
    if (/SELECT COUNT\(\*\) AS unread_count FROM notifications WHERE recipient_id = \? AND is_read = FALSE/i.test(cleanSql)) {
      const uid = parseInt(params[0], 10);
      const count = this.notifications.filter(n => n.recipient_id === uid && !n.is_read).length;
      return [[{ unread_count: count }]];
    }
    if (/UPDATE notifications SET is_read = TRUE WHERE notification_id = \? AND recipient_id = \?/i.test(cleanSql)) {
      const [nid, uid] = params;
      const n = this.notifications.find(not => not.notification_id === parseInt(nid, 10) && not.recipient_id === parseInt(uid, 10));
      if (n) n.is_read = 1;
      return [{ affectedRows: n ? 1 : 0 }];
    }
    if (/UPDATE notifications SET is_read = TRUE WHERE recipient_id = \? AND is_read = FALSE/i.test(cleanSql)) {
      const uid = parseInt(params[0], 10);
      let count = 0;
      this.notifications.forEach(n => {
        if (n.recipient_id === uid && !n.is_read) {
          n.is_read = 1;
          count++;
        }
      });
      return [{ affectedRows: count }];
    }

    // 7. Admin Dashboard Counters & Analytics
    if (/SELECT COUNT\(\*\) AS total_reports/i.test(cleanSql)) {
      const total = this.waste_reports.length;
      const pending = this.waste_reports.filter(r => ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'].includes(r.status)).length;
      const reported = this.waste_reports.filter(r => r.status === 'REPORTED').length;
      const in_progress = this.waste_reports.filter(r => r.status === 'IN_PROGRESS').length;
      const completed = this.waste_reports.filter(r => r.status === 'RESOLVED').length;
      const rejected = this.waste_reports.filter(r => r.status === 'REJECTED').length;
      const critical = this.waste_reports.filter(r => ['HIGH', 'CRITICAL'].includes(r.priority) && r.status !== 'RESOLVED').length;
      return [[{
        total_reports: total,
        pending_reports: pending,
        reported_reports: reported,
        in_progress_reports: in_progress,
        completed_reports: completed,
        rejected_reports: rejected,
        critical_active_reports: critical
      }]];
    }
    if (/SELECT COUNT\(\*\) AS total_users/i.test(cleanSql)) {
      const activeUsers = this.users.filter(u => u.is_active);
      return [[{
        total_users: activeUsers.length,
        total_students: activeUsers.filter(u => u.role === 'STUDENT').length,
        total_staff: activeUsers.filter(u => u.role === 'STAFF').length,
        total_admins: activeUsers.filter(u => u.role === 'ADMIN').length
      }]];
    }
    if (/SELECT COUNT\(\*\) AS total_cleaning_staff/i.test(cleanSql)) {
      return [[{
        total_cleaning_staff: this.cleaning_staff.length,
        available_staff: this.cleaning_staff.filter(s => s.is_available).length
      }]];
    }
    if (/SELECT s\.staff_id, s\.user_id .* FROM cleaning_staff s/i.test(cleanSql)) {
      const rows = this.cleaning_staff.map(s => {
        const u = this.users.find(usr => usr.user_id === s.user_id) || {};
        const active = this.assignments.filter(a => a.staff_id === s.staff_id && ['ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(a.assignment_status)).length;
        const comp = this.assignments.filter(a => a.staff_id === s.staff_id && a.assignment_status === 'COMPLETED').length;
        return {
          staff_id: s.staff_id,
          user_id: s.user_id,
          employee_code: s.employee_code,
          assigned_zone: s.assigned_zone,
          shift_timing: s.shift_timing,
          is_available: s.is_available,
          full_name: u.full_name,
          email: u.email,
          phone_number: u.phone_number,
          active_tasks: active,
          completed_tasks: comp
        };
      });
      return [rows];
    }
    if (/ORDER BY r\.created_at DESC LIMIT \?/i.test(cleanSql)) {
      const limit = params[0] || 8;
      const rows = this.waste_reports
        .slice()
        .reverse()
        .slice(0, limit)
        .map(r => {
          const u = this.users.find(usr => usr.user_id === r.reporter_id) || {};
          const l = this.locations.find(loc => loc.location_id === r.location_id) || {};
          const c = this.categories.find(cat => cat.category_id === r.category_id) || {};
          const beforeImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'BEFORE');
          const afterImg = this.before_after_images.find(img => img.report_id === r.report_id && img.image_type === 'AFTER');
          return {
            report_id: r.report_id,
            ticket_code: r.ticket_code,
            description: r.description,
            priority: r.priority,
            status: r.status,
            created_at: r.created_at,
            reporter_name: u.full_name,
            zone_name: l.zone_name,
            building_name: l.building_name,
            floor_or_landmark: l.floor_or_landmark,
            latitude: l.latitude,
            longitude: l.longitude,
            category_name: c.category_name,
            color_code: c.color_code,
            before_image: beforeImg ? beforeImg.image_url : null,
            after_image: afterImg ? afterImg.image_url : null
          };
        });
      return [rows];
    }

    // Analytics Sub-queries
    if (/DATE_SUB\(CURDATE\(\), INTERVAL 14 DAY\)/i.test(cleanSql)) {
      // Daily rows
      const dailyMap = {};
      this.waste_reports.forEach(r => {
        const d = new Date(r.created_at);
        const key = d.toISOString().slice(0, 10);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dailyMap[key]) dailyMap[key] = { date_key: key, date_label: label, count: 0 };
        dailyMap[key].count++;
      });
      return [Object.values(dailyMap)];
    }
    if (/YEARWEEK\(created_at, 1\)/i.test(cleanSql)) {
      // Weekly rows
      return [[
        { week_key: '202636', week_label: 'Wk 36', count: this.waste_reports.length }
      ]];
    }
    if (/DATE_FORMAT\(created_at, '%Y-%m'\)/i.test(cleanSql)) {
      // Monthly rows
      const total = this.waste_reports.length;
      const res = this.waste_reports.filter(r => r.status === 'RESOLVED').length;
      return [[
        { month_key: '2026-09', month_label: 'Sep 2026', total_submitted: total, total_resolved: res }
      ]];
    }
    if (/FROM waste_categories c LEFT JOIN waste_reports r/i.test(cleanSql)) {
      // Category distribution
      const rows = this.categories.map(c => {
        const matching = this.waste_reports.filter(r => r.category_id === c.category_id);
        return {
          category_id: c.category_id,
          category_name: c.category_name,
          color_code: c.color_code,
          is_hazardous: c.is_hazardous,
          report_count: matching.length,
          resolved_count: matching.filter(r => r.status === 'RESOLVED').length
        };
      });
      return [rows];
    }
    if (/FROM locations l LEFT JOIN waste_reports r/i.test(cleanSql)) {
      // Location hotspots
      const rows = this.locations.map(l => {
        const matching = this.waste_reports.filter(r => r.location_id === l.location_id);
        return {
          location_id: l.location_id,
          zone_name: l.zone_name,
          building_name: l.building_name,
          floor_or_landmark: l.floor_or_landmark,
          incident_count: matching.length,
          active_incidents: matching.filter(r => r.status !== 'RESOLVED').length
        };
      }).filter(l => l.incident_count > 0);
      return [rows];
    }
    if (/COUNT\(\*\) AS total_reports/i.test(cleanSql)) {
      const now = Date.now();
      const oneWeekAgo = now - 7 * 86400000;
      const oneMonthAgo = now - 30 * 86400000;
      const todayDateStr = new Date().toISOString().slice(0, 10);

      const total = this.waste_reports.length;
      const thisWeek = this.waste_reports.filter(r => new Date(r.created_at).getTime() >= oneWeekAgo).length;
      const thisMonth = this.waste_reports.filter(r => new Date(r.created_at).getTime() >= oneMonthAgo).length;
      const today = this.waste_reports.filter(r => new Date(r.created_at).toISOString().slice(0, 10) === todayDateStr).length;
      const pending = this.waste_reports.filter(r => ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'].includes(r.status)).length;
      const completed = this.waste_reports.filter(r => r.status === 'RESOLVED').length;
      const rejected = this.waste_reports.filter(r => r.status === 'REJECTED').length;

      return [[{
        total_reports: total,
        reports_this_week: thisWeek,
        reports_this_month: thisMonth,
        reports_today: today,
        pending_reports: pending,
        completed_reports: completed,
        rejected_reports: rejected
      }]];
    }
    if (/SUM\(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END\) AS completed_count/i.test(cleanSql)) {
      const comp = this.waste_reports.filter(r => r.status === 'RESOLVED').length;

      const pend = this.waste_reports.filter(r => ['REPORTED', 'ASSIGNED', 'IN_PROGRESS'].includes(r.status)).length;
      const rej = this.waste_reports.filter(r => r.status === 'REJECTED').length;
      return [[{
        completed_count: comp,
        pending_count: pend,
        rejected_count: rej,
        total_count: this.waste_reports.length
      }]];
    }
    if (/SELECT priority, COUNT\(\*\) AS count FROM waste_reports/i.test(cleanSql)) {
      const prios = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(p => ({
        priority: p,
        count: this.waste_reports.filter(r => r.priority === p).length
      }));
      return [prios];
    }
    if (/COUNT\(\*\) AS total_high_priority/i.test(cleanSql)) {
      const hp = this.waste_reports.filter(r => ['HIGH', 'CRITICAL'].includes(r.priority));
      return [[{
        total_high_priority: hp.length,
        resolved_high_priority: hp.filter(r => r.status === 'RESOLVED').length,
        active_high_priority: hp.filter(r => r.status !== 'RESOLVED').length,
        critical_count: hp.filter(r => r.priority === 'CRITICAL').length,
        high_count: hp.filter(r => r.priority === 'HIGH').length
      }]];
    }
    if (/FROM cleaning_staff s JOIN users u .* assignments a/i.test(cleanSql)) {
      const rows = this.cleaning_staff.map(s => {
        const u = this.users.find(usr => usr.user_id === s.user_id) || {};
        const comp = this.assignments.filter(a => a.staff_id === s.staff_id && a.assignment_status === 'COMPLETED').length;
        const act = this.assignments.filter(a => a.staff_id === s.staff_id && ['ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(a.assignment_status)).length;
        return {
          staff_id: s.staff_id,
          full_name: u.full_name,
          employee_code: s.employee_code,
          assigned_zone: s.assigned_zone,
          completed_count: comp,
          active_count: act,
          avg_turnaround_minutes: 45
        };
      });
      return [rows];
    }
    if (/AVG\(TIMESTAMPDIFF\(MINUTE/i.test(cleanSql)) {
      const comp = this.waste_reports.filter(r => r.status === 'RESOLVED').length;
      return [[{
        resolved_count: comp,
        avg_resolution_minutes: 52,
        avg_resolution_hours: 0.9
      }]];
    }

    // Default fallback
    console.log('⚠️ Embedded DB fallback unhandled query:', cleanSql);
    return [[]];
  }

  // Connection transaction emulation
  async getConnection() {
    const self = this;
    return {
      query: (sql, params) => self.query(sql, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {}
    };
  }
}

const embeddedDb = new EmbeddedDatabase();

module.exports = embeddedDb;
