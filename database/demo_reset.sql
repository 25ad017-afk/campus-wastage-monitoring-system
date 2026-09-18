-- ====================================================================
-- CAMPUS WASTE MONITORING SYSTEM (CWMS) - DEMO DATA RESET
-- Purpose: Safely removes demo reports, assignments, and extra users
--          Restores clean baseline state with default Admin, Staff & Student
-- ====================================================================

USE campus_waste_db;

-- 1. CLEAR TRANSACTIONAL TABLES
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE waste_collection;
TRUNCATE TABLE assignments;
TRUNCATE TABLE before_after_images;
TRUNCATE TABLE notifications;
TRUNCATE TABLE waste_reports;

-- 2. RESTORE DEFAULT BASELINE USERS
DELETE FROM cleaning_staff WHERE staff_id > 1;
DELETE FROM users WHERE user_id > 3;

-- Baseline Admin (user_id: 1)
INSERT INTO users (user_id, full_name, email, password_hash, role, phone_number, is_active) VALUES
(1, 'Campus Chief Administrator', 'admin@acetcbe.edu.in', '$2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O', 'ADMIN', '9876543210', TRUE),
(2, 'Ramesh Kumar (Cleaning Crew)', 'ramesh.staff@acetcbe.edu.in', '$2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O', 'STAFF', '9876543211', TRUE),
(3, 'Priya Sharma (Student)', 'priya.student@acetcbe.edu.in', '$2a$10$wT8yGZkE45P21vVvL41d5.eW2O2PqJ7K6rU7D4hU6T5J3R0P7Yh8O', 'STUDENT', '9876543212', TRUE)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO cleaning_staff (staff_id, user_id, employee_code, assigned_zone, shift_timing, is_available) VALUES
(1, 2, 'STF-2026-01', 'North Zone', 'MORNING', TRUE)
ON DUPLICATE KEY UPDATE is_available = TRUE;

SET FOREIGN_KEY_CHECKS = 1;
