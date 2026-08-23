const pool = require('../config/db');

exports.getStats = async (req, res, next) => {
  try {
    const [byStatus, byCategory, overdueCount, recent] = await Promise.all([
      pool.query('SELECT status, COUNT(*) as count FROM complaints GROUP BY status'),
      pool.query('SELECT category, COUNT(*) as count FROM complaints GROUP BY category'),
      pool.query("SELECT COUNT(*) as count FROM complaints WHERE is_overdue = true AND status != 'Resolved'"),
      pool.query('SELECT c.*, u.name as resident_name, u.flat_no FROM complaints c JOIN users u ON c.user_id = u.id ORDER BY c.created_at DESC LIMIT 5')
    ]);
    res.json({
      byStatus: byStatus.rows,
      byCategory: byCategory.rows,
      overdueCount: parseInt(overdueCount.rows[0].count),
      recentComplaints: recent.rows
    });
  } catch (err) { next(err); }
};
