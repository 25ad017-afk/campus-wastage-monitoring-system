-- ====================================================================
-- CAMPUS WASTE MONITORING SYSTEM (CWMS) - SEED DATA
-- ====================================================================

USE campus_waste_db;

-- 1. SEED DEFAULT WASTE CATEGORIES
INSERT INTO waste_categories (category_id, category_name, description, color_code, is_hazardous) VALUES
(1, 'Dry / Recyclable', 'Cardboard, paper, clean plastic bottles, soda cans', '#3b82f6', FALSE),
(2, 'Wet / Organic', 'Food leftovers, cafeteria waste, leaves, compostable matter', '#22c55e', FALSE),
(3, 'E-Waste', 'Broken circuit boards, charging cables, batteries, monitors', '#eab308', FALSE),
(4, 'Hazardous / Chemical', 'Laboratory chemicals, broken glassware, medical waste', '#ef4444', TRUE),
(5, 'General / Mixed Litter', 'Multi-layer packaging, street sweepings, wrappers', '#64748b', FALSE)
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);

-- 2. SEED CAMPUS LOCATIONS (Akshaya College of Engineering and Technology - ACET)
INSERT INTO locations (location_id, zone_name, building_name, floor_or_landmark, latitude, longitude) VALUES
-- 1. Academic Area
(1, 'Academic Area', 'Academic Area', 'Classrooms', 10.82650000, 77.01950000),
(2, 'Academic Area', 'Academic Area', 'Smart Classrooms', 10.82670000, 77.01970000),
(3, 'Academic Area', 'Academic Area', 'Academic Corridor', 10.82680000, 77.01980000),
(4, 'Academic Area', 'Academic Area', 'Academic Common Area', 10.82690000, 77.01990000),

-- 2. Central Library
(5, 'Central Library', 'Central Library', 'Central Library Entrance', 10.82680000, 77.01880000),
(6, 'Central Library', 'Central Library', 'Reading Area', 10.82690000, 77.01890000),
(7, 'Central Library', 'Central Library', 'Library Common Area', 10.82700000, 77.01900000),

-- 3. Laboratory Area
(8, 'Laboratory Area', 'Laboratory Area', 'Laboratory Entrance', 10.82750000, 77.01950000),
(9, 'Laboratory Area', 'Laboratory Area', 'Computer Laboratory', 10.82760000, 77.01960000),
(10, 'Laboratory Area', 'Laboratory Area', 'Engineering Laboratory', 10.82770000, 77.01970000),
(11, 'Laboratory Area', 'Laboratory Area', 'Laboratory Common Area', 10.82780000, 77.01980000),

-- 4. Smart Classroom Area
(12, 'Smart Classroom Area', 'Smart Classroom Area', 'Smart Classroom Entrance', 10.82800000, 77.01980000),
(13, 'Smart Classroom Area', 'Smart Classroom Area', 'Smart Classroom', 10.82810000, 77.01990000),
(14, 'Smart Classroom Area', 'Smart Classroom Area', 'Smart Classroom Common Area', 10.82820000, 77.02000000),

-- 5. Administrative / Office Area
(15, 'Administrative / Office Area', 'Administrative / Office Area', 'Administrative Office', 10.82580000, 77.01900000),
(16, 'Administrative / Office Area', 'Administrative / Office Area', 'Principal / Administration Area', 10.82590000, 77.01910000),
(17, 'Administrative / Office Area', 'Administrative / Office Area', 'Office Common Area', 10.82570000, 77.01890000),
(18, 'Administrative / Office Area', 'Administrative / Office Area', 'Controller of Examinations Office', 10.82600000, 77.01920000),

-- 6. Conference Hall
(19, 'Conference Hall', 'Conference Hall', 'Conference Hall Entrance', 10.82640000, 77.02150000),
(20, 'Conference Hall', 'Conference Hall', 'Conference Hall', 10.82650000, 77.02160000),

-- 7. Guest Room & TV Hall
(21, 'Guest Room & TV Hall', 'Guest Room & TV Hall', 'Guest Room', 10.82550000, 77.02150000),
(22, 'Guest Room & TV Hall', 'Guest Room & TV Hall', 'TV Hall', 10.82560000, 77.02160000),

-- 8. Food Court & Amenity Center
(23, 'Food Court & Amenity Center', 'Food Court & Amenity Center', 'Food Court', 10.82720000, 77.02100000),
(24, 'Food Court & Amenity Center', 'Food Court & Amenity Center', 'Amenity Center', 10.82730000, 77.02110000),
(25, 'Food Court & Amenity Center', 'Food Court & Amenity Center', 'Food Court Entrance', 10.82740000, 77.02120000),
(26, 'Food Court & Amenity Center', 'Food Court & Amenity Center', 'Food Waste Collection Area', 10.82750000, 77.02130000),

-- 9. Hostel Area
(27, 'Hostel Area', 'Hostel Area', 'Hostel Entrance', 10.82950000, 77.01800000),
(28, 'Hostel Area', 'Hostel Area', 'Hostel Common Area', 10.82960000, 77.01810000),
(29, 'Hostel Area', 'Hostel Area', 'Hostel Dining Area', 10.82970000, 77.01820000),
(30, 'Hostel Area', 'Hostel Area', 'Hostel Waste Collection Area', 10.82980000, 77.01830000),

-- 10. Sports Area
(31, 'Sports Area', 'Sports Area', 'Sports Ground', 10.82800000, 77.02350000),
(32, 'Sports Area', 'Sports Area', 'Sports Facilities', 10.82810000, 77.02360000),
(33, 'Sports Area', 'Sports Area', 'Sports Common Area', 10.82820000, 77.02370000),

-- 11. Fitness Centre
(34, 'Fitness Centre', 'Fitness Centre', 'Fitness Centre Entrance', 10.82850000, 77.02380000),
(35, 'Fitness Centre', 'Fitness Centre', 'Fitness Centre', 10.82860000, 77.02390000),

-- 12. Transport Area
(36, 'Transport Area', 'Transport Area', 'College Bus Area', 10.82480000, 77.01750000),
(37, 'Transport Area', 'Transport Area', 'Bus Parking Area', 10.82490000, 77.01760000),
(38, 'Transport Area', 'Transport Area', 'Transport Area', 10.82470000, 77.01740000),

-- 13. Main Entrance
(39, 'Main Entrance', 'Main Entrance', 'Main Gate', 10.82500000, 77.01800000),
(40, 'Main Entrance', 'Main Entrance', 'Entrance Road', 10.82510000, 77.01810000),
(41, 'Main Entrance', 'Main Entrance', 'Security Area', 10.82520000, 77.01820000),
(42, 'Main Entrance', 'Main Entrance', 'Visitor Area', 10.82530000, 77.01830000),

-- 14. Campus Internal Area
(43, 'Campus Internal Area', 'Campus Internal Area', 'Internal Road', 10.82600000, 77.01980000),
(44, 'Campus Internal Area', 'Campus Internal Area', 'Walkway', 10.82610000, 77.01990000),
(45, 'Campus Internal Area', 'Campus Internal Area', 'Common Campus Area', 10.82620000, 77.02000000),

-- 15. Green Campus Area
(46, 'Green Campus Area', 'Green Campus Area', 'Garden Area', 10.82420000, 77.02120000),
(47, 'Green Campus Area', 'Green Campus Area', 'Green Campus Area', 10.82430000, 77.02130000),
(48, 'Green Campus Area', 'Green Campus Area', 'Open Campus Area', 10.82440000, 77.02140000),

-- 16. Student Activity Area
(49, 'Student Activity Area', 'Student Activity Area', 'Student Activity Area', 10.82760000, 77.02250000),
(50, 'Student Activity Area', 'Student Activity Area', 'Club / Activity Area', 10.82770000, 77.02260000),
(51, 'Student Activity Area', 'Student Activity Area', 'Event Area', 10.82780000, 77.02270000),

-- 17. Waste Collection Area
(52, 'Waste Collection Area', 'Waste Collection Area', 'Main Waste Collection Point', 10.82450000, 77.02200000),
(53, 'Waste Collection Area', 'Waste Collection Area', 'Segregated Waste Collection Area', 10.82460000, 77.02210000),
(54, 'Waste Collection Area', 'Waste Collection Area', 'Waste Storage Area', 10.82470000, 77.02220000),

-- 18. Other Campus Area
(55, 'Other Campus Area', 'Other Campus Area', 'Other Location', 10.82400000, 77.02100000)
ON DUPLICATE KEY UPDATE building_name = VALUES(building_name);

-- 3. SEED DEFAULT ADMIN USER (Password: Admin@123)
-- Hash below is bcrypt for 'Admin@123'
INSERT INTO users (user_id, full_name, email, password_hash, role, phone_number, is_active) VALUES
(1, 'Campus Chief Administrator', 'admin@acetcbe.edu.in', '$2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O', 'ADMIN', '9876543210', TRUE)
ON DUPLICATE KEY UPDATE email = VALUES(email);
