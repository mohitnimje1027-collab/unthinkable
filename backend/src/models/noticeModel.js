const pool = require('../config/db');

const createNotice = async ({ title, content, is_important, created_by }) => {
  const res = await pool.query(
    `INSERT INTO notices (title, content, is_important, created_by) VALUES ($1, $2, $3, $4) RETURNING *`,
    [title, content, is_important, created_by]
  );
  return res.rows[0];
};

const getAllNotices = async () => {
  const res = await pool.query(
    `SELECT n.*, u.name as admin_name
     FROM notices n LEFT JOIN users u ON n.created_by = u.id
     ORDER BY n.is_important DESC, n.created_at DESC`
  );
  return res.rows;
};

const deleteNotice = async (id) => {
  await pool.query(`DELETE FROM notices WHERE id = $1`, [id]);
};

module.exports = { createNotice, getAllNotices, deleteNotice };
