const pool = require('../config/db');

const createComplaint = async ({ user_id, category, description, photo_url }) => {
  const res = await pool.query(
    INSERT INTO complaints (user_id, category, description, photo_url, status, priority)
     VALUES (\,\,\,\,'Open','Medium')
     RETURNING *,
    [user_id, category, description, photo_url]
  );
  const complaint = res.rows[0];
  await pool.query(
    INSERT INTO complaint_history (complaint_id, status, note, changed_by)
     VALUES (\,'Open','Complaint submitted',\),
    [complaint.id, user_id]
  );
  return complaint;
};

const getComplaintsByUser = async (user_id) => {
  const res = await pool.query(
    SELECT c.*, u.name as resident_name, u.flat_no
     FROM complaints c JOIN users u ON c.user_id = u.id
     WHERE c.user_id = \
     ORDER BY c.created_at DESC,
    [user_id]
  );
  return res.rows;
};

const getAllComplaints = async ({ category, status, date_from, date_to } = {}) => {
  let query = SELECT c.*, u.name as resident_name, u.email as resident_email, u.flat_no
               FROM complaints c JOIN users u ON c.user_id = u.id WHERE 1=1;
  const params = [];
  let idx = 1;
  if (category) { query +=  AND c.category = \$ + idx++; params.push(category); }
  if (status) { query +=  AND c.status = \$ + idx++; params.push(status); }
  if (date_from) { query +=  AND c.created_at >= \$ + idx++; params.push(date_from); }
  if (date_to) { query +=  AND c.created_at <= \$ + idx++; params.push(date_to); }
  query +=  ORDER BY c.is_overdue DESC, c.created_at DESC;
  const res = await pool.query(query, params);
  return res.rows;
};

const getComplaintById = async (id) => {
  const res = await pool.query(
    SELECT c.*, u.name as resident_name, u.email as resident_email, u.flat_no
     FROM complaints c JOIN users u ON c.user_id = u.id WHERE c.id = \,
    [id]
  );
  return res.rows[0];
};

const updateComplaintStatus = async (id, { status, priority, note, changed_by }) => {
  const updates = [];
  const params = [];
  let idx = 1;
  if (status) { updates.push('status = \$' + idx++); params.push(status); }
  if (priority) { updates.push('priority = \$' + idx++); params.push(priority); }
  updates.push('updated_at = NOW()');
  params.push(id);
  const res = await pool.query(
    'UPDATE complaints SET ' + updates.join(', ') + ' WHERE id = \$' + idx + ' RETURNING *',
    params
  );
  const complaint = res.rows[0];
  if (status) {
    await pool.query(
      'INSERT INTO complaint_history (complaint_id, status, note, changed_by) VALUES (\,\,\,\)',
      [id, status, note || null, changed_by]
    );
  }
  return complaint;
};

const markOverdue = async (id, is_overdue) => {
  const res = await pool.query(
    'UPDATE complaints SET is_overdue = \, updated_at = NOW() WHERE id = \ RETURNING *',
    [is_overdue, id]
  );
  return res.rows[0];
};

const getComplaintHistory = async (complaint_id) => {
  const res = await pool.query(
    SELECT ch.*, u.name as changed_by_name
     FROM complaint_history ch LEFT JOIN users u ON ch.changed_by = u.id
     WHERE ch.complaint_id = \
     ORDER BY ch.changed_at ASC,
    [complaint_id]
  );
  return res.rows;
};

const getOverdueComplaints = async (overdue_days = 7) => {
  const res = await pool.query(
    SELECT c.*, u.email as resident_email
     FROM complaints c JOIN users u ON c.user_id = u.id
     WHERE c.status != 'Resolved'
     AND c.created_at < NOW() - INTERVAL '1 day' * \,
    [overdue_days]
  );
  return res.rows;
};

module.exports = {
  createComplaint, getComplaintsByUser, getAllComplaints, getComplaintById,
  updateComplaintStatus, markOverdue, getComplaintHistory, getOverdueComplaints
};
