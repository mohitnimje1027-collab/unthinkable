-- ============================================================
-- Society Maintenance Tracker — MySQL Schema
-- ============================================================

DROP DATABASE IF EXISTS society_tracker;
CREATE DATABASE society_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE society_tracker;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          ENUM('resident','admin') NOT NULL DEFAULT 'resident',
    flat_no       VARCHAR(20),
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- COMPLAINTS
-- ============================================================
CREATE TABLE complaints (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT NOT NULL,
    category    ENUM('Plumbing','Electrical','Cleaning','Security','Other') NOT NULL,
    description TEXT NOT NULL,
    photo_url   TEXT,
    status      ENUM('Open','In Progress','Resolved') NOT NULL DEFAULT 'Open',
    priority    ENUM('Low','Medium','High') NOT NULL DEFAULT 'Medium',
    is_overdue  TINYINT(1) NOT NULL DEFAULT 0,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_is_overdue (is_overdue)
);

-- ============================================================
-- COMPLAINT HISTORY
-- ============================================================
CREATE TABLE complaint_history (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id  INT NOT NULL,
    status        VARCHAR(20) NOT NULL,
    note          TEXT,
    changed_by    INT,
    changed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_complaint_id (complaint_id)
);

-- ============================================================
-- NOTICES
-- ============================================================
CREATE TABLE notices (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    content      TEXT NOT NULL,
    is_important TINYINT(1) NOT NULL DEFAULT 0,
    created_by   INT,
    created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
-- SEED: Admin user  (password = admin123)
-- ============================================================
INSERT INTO users (name, email, password_hash, role, flat_no)
VALUES (
    'Admin',
    'admin@society.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
    'admin',
    NULL
);
