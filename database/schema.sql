-- ============================================================
-- Society Maintenance Tracker — Database Schema
-- ============================================================

-- Drop existing tables (in correct dependency order)
DROP TABLE IF EXISTS complaint_history CASCADE;
DROP TABLE IF EXISTS complaints CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- USERS TABLE
-- ============================================================
CREATE TABLE users (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'resident' CHECK (role IN ('resident', 'admin')),
    flat_no         VARCHAR(20),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- COMPLAINTS TABLE
-- ============================================================
CREATE TABLE complaints (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category    VARCHAR(50) NOT NULL CHECK (category IN ('Plumbing', 'Electrical', 'Cleaning', 'Security', 'Other')),
    description TEXT NOT NULL,
    photo_url   TEXT,
    status      VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
    priority    VARCHAR(10) NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
    is_overdue  BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common filters
CREATE INDEX idx_complaints_user_id   ON complaints(user_id);
CREATE INDEX idx_complaints_status    ON complaints(status);
CREATE INDEX idx_complaints_category  ON complaints(category);
CREATE INDEX idx_complaints_is_overdue ON complaints(is_overdue);

-- ============================================================
-- COMPLAINT HISTORY TABLE
-- ============================================================
CREATE TABLE complaint_history (
    id            SERIAL PRIMARY KEY,
    complaint_id  INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    status        VARCHAR(20) NOT NULL,
    note          TEXT,
    changed_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
    changed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_history_complaint_id ON complaint_history(complaint_id);

-- ============================================================
-- NOTICES TABLE
-- ============================================================
CREATE TABLE notices (
    id           SERIAL PRIMARY KEY,
    title        VARCHAR(200) NOT NULL,
    content      TEXT NOT NULL,
    is_important BOOLEAN NOT NULL DEFAULT FALSE,
    created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SEED DATA — Admin user
-- Password: admin123 (bcrypt hash)
-- ============================================================
INSERT INTO users (name, email, password_hash, role, flat_no)
VALUES (
    'Admin',
    'admin@society.com',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
    'admin',
    NULL
);

-- NOTE: To create more admin users, update role='admin' via SQL or
-- use a separate admin-seeding script.
