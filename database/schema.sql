-- ====================================================================
-- CAMPUS WASTE MONITORING SYSTEM (CWMS) - DATABASE SCHEMA (MySQL 8.0+)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS campus_waste_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE campus_waste_db;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('STUDENT', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'STUDENT',
  phone_number VARCHAR(15) NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- 2. CAMPUS LOCATIONS TABLE
CREATE TABLE IF NOT EXISTS locations (
  location_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  zone_name VARCHAR(50) NOT NULL,
  building_name VARCHAR(100) NOT NULL,
  floor_or_landmark VARCHAR(150) NOT NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_locations_zone (zone_name),
  INDEX idx_locations_building (building_name)
) ENGINE=InnoDB;

-- 3. WASTE CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS waste_categories (
  category_id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category_name VARCHAR(50) NOT NULL UNIQUE,
  description VARCHAR(255) NULL,
  color_code VARCHAR(7) NOT NULL DEFAULT '#64748b',
  is_hazardous BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 4. CLEANING STAFF PROFILES TABLE
CREATE TABLE IF NOT EXISTS cleaning_staff (
  staff_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  employee_code VARCHAR(30) NOT NULL UNIQUE,
  assigned_zone VARCHAR(50) NULL,
  shift_timing ENUM('MORNING', 'AFTERNOON', 'EVENING', 'NIGHT') NOT NULL DEFAULT 'MORNING',
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_staff_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. WASTE REPORTS TABLE
CREATE TABLE IF NOT EXISTS waste_reports (
  report_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_code VARCHAR(20) NOT NULL UNIQUE,
  reporter_id INT UNSIGNED NOT NULL,
  location_id INT UNSIGNED NOT NULL,
  category_id TINYINT UNSIGNED NOT NULL,
  description TEXT NULL,
  priority ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  status ENUM('REPORTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'REPORTED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE RESTRICT,
  CONSTRAINT fk_report_location FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE RESTRICT,
  CONSTRAINT fk_report_category FOREIGN KEY (category_id) REFERENCES waste_categories(category_id) ON DELETE RESTRICT,
  INDEX idx_reports_status_priority (status, priority),
  INDEX idx_reports_created (created_at)
) ENGINE=InnoDB;

-- 6. BEFORE & AFTER IMAGES TABLE
CREATE TABLE IF NOT EXISTS before_after_images (
  image_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_id INT UNSIGNED NOT NULL,
  uploaded_by INT UNSIGNED NOT NULL,
  image_type ENUM('BEFORE', 'AFTER') NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  file_size_kb INT UNSIGNED NULL,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_img_report FOREIGN KEY (report_id) REFERENCES waste_reports(report_id) ON DELETE CASCADE,
  CONSTRAINT fk_img_user FOREIGN KEY (uploaded_by) REFERENCES users(user_id) ON DELETE RESTRICT,
  INDEX idx_images_report (report_id, image_type)
) ENGINE=InnoDB;

-- 7. TASK ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS assignments (
  assignment_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  report_id INT UNSIGNED NOT NULL,
  staff_id INT UNSIGNED NOT NULL,
  assigned_by INT UNSIGNED NOT NULL,
  assignment_status ENUM('ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'COMPLETED', 'REASSIGNED') NOT NULL DEFAULT 'ASSIGNED',
  assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at DATETIME NULL,
  admin_notes VARCHAR(255) NULL,
  CONSTRAINT fk_assign_report FOREIGN KEY (report_id) REFERENCES waste_reports(report_id) ON DELETE CASCADE,
  CONSTRAINT fk_assign_staff FOREIGN KEY (staff_id) REFERENCES cleaning_staff(staff_id) ON DELETE RESTRICT,
  CONSTRAINT fk_assign_admin FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE RESTRICT,
  INDEX idx_assignments_staff_status (staff_id, assignment_status)
) ENGINE=InnoDB;

-- 8. WASTE COLLECTION / RESOLUTIONS TABLE
CREATE TABLE IF NOT EXISTS waste_collection (
  collection_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT UNSIGNED NOT NULL UNIQUE,
  report_id INT UNSIGNED NOT NULL,
  staff_id INT UNSIGNED NOT NULL,
  collection_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  waste_weight_kg DECIMAL(6,2) NULL,
  disposal_destination VARCHAR(100) NOT NULL DEFAULT 'Campus Main Dumpster',
  verified_by_admin INT UNSIGNED NULL,
  verification_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  remarks TEXT NULL,
  CONSTRAINT fk_coll_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
  CONSTRAINT fk_coll_report FOREIGN KEY (report_id) REFERENCES waste_reports(report_id) ON DELETE CASCADE,
  CONSTRAINT fk_coll_staff FOREIGN KEY (staff_id) REFERENCES cleaning_staff(staff_id) ON DELETE RESTRICT,
  CONSTRAINT fk_coll_verifier FOREIGN KEY (verified_by_admin) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  notification_id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  recipient_id INT UNSIGNED NOT NULL,
  report_id INT UNSIGNED NULL,
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  notification_type ENUM('REPORT_FILED', 'TASK_ASSIGNED', 'STATUS_UPDATE', 'VERIFICATION_ALERT') NOT NULL DEFAULT 'STATUS_UPDATE',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notif_recipient FOREIGN KEY (recipient_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_notif_report FOREIGN KEY (report_id) REFERENCES waste_reports(report_id) ON DELETE SET NULL,
  INDEX idx_notif_user_unread (recipient_id, is_read)
) ENGINE=InnoDB;
