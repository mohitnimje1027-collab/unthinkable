const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, '../../..', 'database', 'schema.sql');

    // If schema.sql is accessible (local dev), run it
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schema);
      console.log('✅ Database schema initialized from schema.sql');
      return;
    }

    // Fallback: inline schema (used on Render where schema.sql may not exist in backend root)
    console.log('📦 Running inline schema initialization...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id              SERIAL PRIMARY KEY,
        name            VARCHAR(100) NOT NULL,
        email           VARCHAR(255) UNIQUE NOT NULL,
        password_hash   TEXT NOT NULL,
        role            VARCHAR(20) NOT NULL DEFAULT 'resident' CHECK (role IN ('resident', 'admin')),
        flat_no         VARCHAR(20),
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS complaints (
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

      CREATE INDEX IF NOT EXISTS idx_complaints_user_id    ON complaints(user_id);
      CREATE INDEX IF NOT EXISTS idx_complaints_status     ON complaints(status);
      CREATE INDEX IF NOT EXISTS idx_complaints_category   ON complaints(category);
      CREATE INDEX IF NOT EXISTS idx_complaints_is_overdue ON complaints(is_overdue);

      CREATE TABLE IF NOT EXISTS complaint_history (
        id            SERIAL PRIMARY KEY,
        complaint_id  INTEGER NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
        status        VARCHAR(20) NOT NULL,
        note          TEXT,
        changed_by    INTEGER REFERENCES users(id) ON DELETE SET NULL,
        changed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_history_complaint_id ON complaint_history(complaint_id);

      CREATE TABLE IF NOT EXISTS notices (
        id           SERIAL PRIMARY KEY,
        title        VARCHAR(200) NOT NULL,
        content      TEXT NOT NULL,
        is_important BOOLEAN NOT NULL DEFAULT FALSE,
        created_by   INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      INSERT INTO users (name, email, password_hash, role, flat_no)
      VALUES (
        'Admin',
        'admin@society.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lHHi',
        'admin',
        NULL
      ) ON CONFLICT (email) DO NOTHING;
    `);

    console.log('✅ Database schema initialized (inline)');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
    // Don't crash the server — tables may already exist
  }
}

module.exports = initDatabase;
