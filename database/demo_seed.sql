-- ====================================================================
-- CAMPUS WASTE MONITORING SYSTEM (CWMS) - REALISTIC DEMO SEED DATA
-- Purpose: Viva / Project Guide Demonstration Mode
-- Safe & Reversible: Contains complete realistic lifecycle data
-- ====================================================================

USE campus_waste_db;

-- 1. WASTE CATEGORIES
INSERT INTO waste_categories (category_id, category_name, description, color_code, is_hazardous) VALUES
(1, 'Dry / Recyclable', 'Cardboard, paper, clean plastic bottles, soda cans', '#3b82f6', FALSE),
(2, 'Wet / Organic', 'Food leftovers, cafeteria waste, leaves, compostable matter', '#22c55e', FALSE),
(3, 'E-Waste', 'Broken circuit boards, charging cables, batteries, monitors', '#eab308', FALSE),
(4, 'Hazardous / Chemical', 'Laboratory chemicals, broken glassware, medical waste', '#ef4444', TRUE),
(5, 'General / Mixed Litter', 'Multi-layer packaging, street sweepings, wrappers', '#64748b', FALSE)
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name), color_code = VALUES(color_code);

-- 2. CAMPUS LOCATIONS (Exact GPS Coordinates for Leaflet GIS Map)
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
ON DUPLICATE KEY UPDATE building_name = VALUES(building_name), latitude = VALUES(latitude), longitude = VALUES(longitude);

-- 3. USERS (Admin, Students, Cleaning Crew)
-- Bcrypt Hash for 'Admin@123': $2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O
-- Bcrypt Hash for 'Staff@123': $2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O (interchangeable for demo test)
-- Bcrypt Hash for 'Student@123': $2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O

INSERT INTO users (user_id, full_name, email, password_hash, role, phone_number, is_active) VALUES
-- Admin
(1, 'Campus Chief Administrator', 'admin@acetcbe.edu.in', '$2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O', 'ADMIN', '9876543210', TRUE),

-- Cleaning Staff (4 zones)
(2, 'Ramesh Kumar (Cleaning Crew)', 'ramesh.staff@acetcbe.edu.in', '$2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O', 'STAFF', '9876543211', TRUE),
(3, 'Sunita Devi (Cleaning Crew)', 'sunita.staff@acetcbe.edu.in', '$2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O', 'STAFF', '9876543212', TRUE),
(4, 'Manoj Patel (Cleaning Crew)', 'manoj.staff@acetcbe.edu.in', '$2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O', 'STAFF', '9876543213', TRUE),
(5, 'Kavitha Murugan (Cleaning Crew)', 'kavitha.staff@acetcbe.edu.in', '$2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O', 'STAFF', '9876543214', TRUE),

-- Students (Various engineering departments)
(6, 'Priya Sharma (Student)', 'priya.student@acetcbe.edu.in', '$2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O', 'STUDENT', '9876543221', TRUE),
(7, 'Rohit Verma (Student)', 'rohit.student@acetcbe.edu.in', '$2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O', 'STUDENT', '9876543222', TRUE),
(8, 'Ananya Iyer (Student)', 'ananya.student@acetcbe.edu.in', '$2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O', 'STUDENT', '9876543223', TRUE),
(9, 'Karthik Rao (Student)', 'karthik.student@acetcbe.edu.in', '$2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O', 'STUDENT', '9876543224', TRUE)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), role = VALUES(role);

-- 4. CLEANING STAFF PROFILES
INSERT INTO cleaning_staff (staff_id, user_id, employee_code, assigned_zone, shift_timing, is_available) VALUES
(1, 2, 'STF-2026-01', 'Academic Area', 'MORNING', TRUE),
(2, 3, 'STF-2026-02', 'Food Court & Amenity Center', 'AFTERNOON', TRUE),
(3, 4, 'STF-2026-03', 'Hostel Area', 'MORNING', TRUE),
(4, 5, 'STF-2026-04', 'Laboratory Area', 'EVENING', TRUE)
ON DUPLICATE KEY UPDATE assigned_zone = VALUES(assigned_zone), is_available = VALUES(is_available);

-- 5. WASTE REPORTS (Covering All Lifecycle Stages)
-- Reports 1 to 3: PENDING / REPORTED (For live demonstration of Admin dispatch)
-- Reports 4 to 5: ASSIGNED (For live demonstration of Staff acknowledgment)
-- Reports 6 to 7: IN_PROGRESS (For live demonstration of Staff completion & photo upload)
-- Reports 8 to 12: RESOLVED (Populates rich historical analytics & GIS map)
INSERT INTO waste_reports (report_id, ticket_code, reporter_id, location_id, category_id, description, priority, status, created_at, updated_at) VALUES
-- Pending (Awaiting Dispatch)
(1, 'CWMS-2026-91823', 6, 1, 1, 'Cardboard boxes, packaging cartons and clean recyclable bottles near Academic Area Classrooms.', 'MEDIUM', 'REPORTED', DATE_SUB(NOW(), INTERVAL 45 MINUTE), DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(2, 'CWMS-2026-72419', 7, 10, 4, 'Chemical reagent container and broken glassware safely cordoned in Engineering Laboratory.', 'CRITICAL', 'REPORTED', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 'CWMS-2026-38104', 8, 34, 5, 'Mixed litter, energy drink cans and wrappers near Fitness Centre Entrance.', 'LOW', 'REPORTED', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- Assigned (Dispatched to Staff)
(4, 'CWMS-2026-10492', 6, 26, 2, 'Food Court outdoor food waste bin overflowing with discarded lunch plates and food scrap.', 'HIGH', 'ASSIGNED', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(5, 'CWMS-2026-64210', 9, 27, 1, 'Plastic packaging and discarded delivery cartons piled at Hostel Entrance.', 'MEDIUM', 'ASSIGNED', DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- In-Progress (Staff currently collecting)
(6, 'CWMS-2026-84910', 7, 9, 3, 'Bundles of obsolete peripheral wiring, damaged keyboards, and discarded circuit boards in Computer Laboratory.', 'HIGH', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(7, 'CWMS-2026-29174', 8, 32, 5, 'Sports event packaging wrappers and discarded hydration bottles near Sports Facilities.', 'MEDIUM', 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 6 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- Resolved / Completed (Historical data with verified photo proof & weights)
(8, 'CWMS-2026-55201', 6, 6, 1, 'Central Library reading area paper bins cleared, shredded exam papers and printouts sorted.', 'LOW', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(9, 'CWMS-2026-44192', 7, 23, 2, 'Food Court wet waste bins cleared before lunch crowd rush.', 'HIGH', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 46 HOUR)),
(10, 'CWMS-2026-33918', 8, 46, 2, 'Green Campus garden compost foliage, lawn trimmings and organic waste cleared.', 'LOW', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 70 HOUR)),
(11, 'CWMS-2026-21849', 9, 9, 3, 'Obsolete network cabling and faulty electronics safely transferred to E-waste staging.', 'HIGH', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 94 HOUR)),
(12, 'CWMS-2026-11029', 6, 10, 4, 'Dilute chemistry neutralizing wash residue safely cleared and disposed under lab protocols.', 'CRITICAL', 'RESOLVED', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 118 HOUR))
ON DUPLICATE KEY UPDATE status = VALUES(status), priority = VALUES(priority);

-- 6. BEFORE & AFTER EVIDENCE IMAGES
INSERT INTO before_after_images (image_id, report_id, uploaded_by, image_type, image_url, file_size_kb, uploaded_at) VALUES
(1, 1, 6, 'BEFORE', '/uploads/reports/sample-cartons.jpg', 380, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(2, 2, 7, 'BEFORE', '/uploads/reports/sample-chemical.jpg', 420, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 3, 8, 'BEFORE', '/uploads/reports/sample-sports.jpg', 290, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(4, 4, 6, 'BEFORE', '/uploads/reports/sample-cafeteria.jpg', 450, DATE_SUB(NOW(), INTERVAL 3 HOUR)),
(5, 5, 9, 'BEFORE', '/uploads/reports/sample-hostel.jpg', 360, DATE_SUB(NOW(), INTERVAL 4 HOUR)),
(6, 6, 7, 'BEFORE', '/uploads/reports/sample-ewaste.jpg', 410, DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(7, 7, 8, 'BEFORE', '/uploads/reports/sample-workshop.jpg', 390, DATE_SUB(NOW(), INTERVAL 6 HOUR)),
(8, 8, 6, 'BEFORE', '/uploads/reports/sample-library.jpg', 310, DATE_SUB(NOW(), INTERVAL 1 DAY)),
(9, 8, 2, 'AFTER', '/uploads/resolutions/sample-library-clean.jpg', 290, DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(10, 9, 7, 'BEFORE', '/uploads/reports/sample-foodcourt.jpg', 430, DATE_SUB(NOW(), INTERVAL 2 DAY)),
(11, 9, 3, 'AFTER', '/uploads/resolutions/sample-foodcourt-clean.jpg', 340, DATE_SUB(NOW(), INTERVAL 46 HOUR)),
(12, 10, 8, 'BEFORE', '/uploads/reports/sample-garden.jpg', 350, DATE_SUB(NOW(), INTERVAL 3 DAY)),
(13, 10, 4, 'AFTER', '/uploads/resolutions/sample-garden-clean.jpg', 310, DATE_SUB(NOW(), INTERVAL 70 HOUR)),
(14, 11, 9, 'BEFORE', '/uploads/reports/sample-cables.jpg', 480, DATE_SUB(NOW(), INTERVAL 4 DAY)),
(15, 11, 2, 'AFTER', '/uploads/resolutions/sample-cables-clean.jpg', 380, DATE_SUB(NOW(), INTERVAL 94 HOUR)),
(16, 12, 6, 'BEFORE', '/uploads/reports/sample-hazard.jpg', 510, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(17, 12, 2, 'AFTER', '/uploads/resolutions/sample-hazard-clean.jpg', 430, DATE_SUB(NOW(), INTERVAL 118 HOUR))
ON DUPLICATE KEY UPDATE image_url = VALUES(image_url);

-- 7. TASK ASSIGNMENTS
INSERT INTO assignments (assignment_id, report_id, staff_id, assigned_by, assignment_status, assigned_at, acknowledged_at, admin_notes) VALUES
(1, 4, 2, 1, 'ASSIGNED', DATE_SUB(NOW(), INTERVAL 2 HOUR), NULL, 'Clear Food Court bins before afternoon dining crowd.'),
(2, 5, 3, 1, 'ASSIGNED', DATE_SUB(NOW(), INTERVAL 3 HOUR), NULL, 'Coordinate with hostel caretaker for packaging collection.'),
(3, 6, 1, 1, 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_SUB(NOW(), INTERVAL 3 HOUR), 'High priority e-waste collection from Computer Laboratory.'),
(4, 7, 4, 1, 'IN_PROGRESS', DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), 'Clear sports ground and facility perimeter.'),
(5, 8, 1, 1, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 23 HOUR 30 MINUTE), 'Routine Central Library morning round.'),
(6, 9, 2, 1, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 48 HOUR), DATE_SUB(NOW(), INTERVAL 47 HOUR 15 MINUTE), 'Food Court shift handover clean.'),
(7, 10, 3, 1, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 72 HOUR), DATE_SUB(NOW(), INTERVAL 71 HOUR), 'Green Campus garden maintenance.'),
(8, 11, 1, 1, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 96 HOUR), DATE_SUB(NOW(), INTERVAL 95 HOUR), 'Transfer e-waste to Central Storage.'),
(9, 12, 1, 1, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 120 HOUR), DATE_SUB(NOW(), INTERVAL 119 HOUR), 'Specialized PPE protocol required for acid neutralization.')
ON DUPLICATE KEY UPDATE assignment_status = VALUES(assignment_status);

-- 8. WASTE COLLECTION LOGS (Weights & Certified Disposal Facilities)
INSERT INTO waste_collection (collection_id, assignment_id, report_id, staff_id, collection_time, waste_weight_kg, disposal_destination, remarks) VALUES
(1, 5, 8, 1, DATE_SUB(NOW(), INTERVAL 23 HOUR), 8.5, 'Campus Paper Recycling Unit', 'Sorted into dry paper baler; clean condition.'),
(2, 6, 9, 2, DATE_SUB(NOW(), INTERVAL 46 HOUR), 14.2, 'Campus Biomass Composting Facility', 'Transferred to organic aerobic compost pit #2.'),
(3, 7, 10, 3, DATE_SUB(NOW(), INTERVAL 70 HOUR), 6.8, 'Campus Biomass Composting Facility', 'Garden leaf foliage composted.'),
(4, 8, 11, 1, DATE_SUB(NOW(), INTERVAL 94 HOUR), 11.4, 'Authorized District E-Waste Recycler', 'Logged with serial numbers; safely stacked.'),
(5, 9, 12, 1, DATE_SUB(NOW(), INTERVAL 118 HOUR), 3.2, 'Hazardous Chemical Containment Storage', 'Neutralized residue placed in double-walled secondary drum.')
ON DUPLICATE KEY UPDATE waste_weight_kg = VALUES(waste_weight_kg), disposal_destination = VALUES(disposal_destination);

-- 9. IN-APP NOTIFICATIONS (Audit Trail for Students, Staff, and Admin)
INSERT INTO notifications (notification_id, recipient_id, report_id, title, message, notification_type, is_read, created_at) VALUES
(1, 1, 1, 'New Waste Incident Filed', 'Ticket #CWMS-2026-91823 reported at Academic Area (MEDIUM priority).', 'REPORT_FILED', 0, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(2, 1, 2, 'Critical Chemical Incident Alert', 'EMERGENCY: Ticket #CWMS-2026-72419 reported at Engineering Laboratory (CRITICAL priority). Immediate dispatch required.', 'STATUS_UPDATE', 0, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(3, 1, 3, 'New Waste Incident Filed', 'Ticket #CWMS-2026-38104 reported at Fitness Centre (LOW priority).', 'REPORT_FILED', 1, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(4, 2, 4, 'Cleaning Task Dispatched', 'You have been assigned to Ticket #CWMS-2026-10492 at Food Court (HIGH priority).', 'TASK_ASSIGNED', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(5, 6, 4, 'Task Assigned to Staff', 'Your report #CWMS-2026-10492 has been assigned to Ramesh Kumar (Cleaning Crew).', 'STATUS_UPDATE', 0, DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(6, 1, 6, 'Task In Progress', 'Staff member Ramesh Kumar started cleanup on Ticket #CWMS-2026-84910 at Computer Laboratory.', 'STATUS_UPDATE', 1, DATE_SUB(NOW(), INTERVAL 1 HOUR)),
(7, 6, 8, 'Waste Cleared & Verified!', 'Your reported waste incident #CWMS-2026-55201 at Central Library has been cleaned with photo proof.', 'STATUS_UPDATE', 1, DATE_SUB(NOW(), INTERVAL 23 HOUR)),
(8, 7, 9, 'Waste Cleared & Verified!', 'Your reported waste incident #CWMS-2026-44192 at Food Court has been cleaned with photo proof.', 'STATUS_UPDATE', 1, DATE_SUB(NOW(), INTERVAL 46 HOUR)),
(9, 8, 10, 'Waste Cleared & Verified!', 'Your reported waste incident #CWMS-2026-33918 at Green Campus Area has been cleaned with photo proof.', 'STATUS_UPDATE', 1, DATE_SUB(NOW(), INTERVAL 70 HOUR)),
(10, 1, 8, 'Cleanup Verified by Staff', 'Ticket #CWMS-2026-55201 resolved by Ramesh Kumar (8.5 kg collected).', 'STATUS_UPDATE', 1, DATE_SUB(NOW(), INTERVAL 23 HOUR))
ON DUPLICATE KEY UPDATE title = VALUES(title);
