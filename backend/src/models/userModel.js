const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const createUser = async ({ name, email, password, role = 'resident', flat_no }) => {
  const hash = await bcrypt.hash(password, 10);
  const res = await pool.query(
    'INSERT INTO users (name, email, password_hash, role, flat_no) VALUES (\,\,\,\,\) RETURNING id, name, email, role, flat_no, created_at',
    [name, email, hash, role, flat_no]
  );
  return res.rows[0];
};

const findUserByEmail = async (email) => {
  const res = await pool.query('SELECT * FROM users WHERE email = \', [email]);
  return res.rows[0];
};

const findUserById = async (id) => {
  const res = await pool.query('SELECT id, name, email, role, flat_no, created_at FROM users WHERE id = \', [id]);
  return res.rows[0];
};

const getAllResidentEmails = async () => {
  const res = await pool.query("SELECT email, name FROM users WHERE role = 'resident'");
  return res.rows;
};

module.exports = { createUser, findUserByEmail, findUserById, getAllResidentEmails };
