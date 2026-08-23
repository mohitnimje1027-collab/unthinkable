const {
  createComplaint, getComplaintsByUser, getAllComplaints,
  getComplaintById, updateComplaintStatus, markOverdue,
  getComplaintHistory, getOverdueComplaints
} = require('../models/complaintModel');
const { findUserById } = require('../models/userModel');
const emailService = require('../services/emailService');

exports.create = async (req, res, next) => {
  try {
    const { category, description } = req.body;
    const photo_url = req.file ? '/uploads/' + req.file.filename : null;
    const complaint = await createComplaint({
      user_id: req.user.id, category, description, photo_url
    });
    res.status(201).json({ complaint });
  } catch (err) { next(err); }
};

exports.getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await getComplaintsByUser(req.user.id);
    res.json({ complaints });
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const { category, status, date_from, date_to } = req.query;
    const complaints = await getAllComplaints({ category, status, date_from, date_to });
    res.json({ complaints });
  } catch (err) { next(err); }
};

exports.getOne = async (req, res, next) => {
  try {
    const complaint = await getComplaintById(req.params.id);
    if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });
    if (req.user.role === 'resident' && complaint.user_id !== req.user.id)
      return res.status(403).json({ error: 'Forbidden.' });
    const history = await getComplaintHistory(req.params.id);
    res.json({ complaint, history });
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const { status, priority, note } = req.body;
    const existing = await getComplaintById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Complaint not found.' });
    if (existing.status === 'Resolved')
      return res.status(400).json({ error: 'Resolved complaints cannot be updated.' });

    const complaint = await updateComplaintStatus(req.params.id, {
      status, priority, note, changed_by: req.user.id
    });

    if (status && status !== existing.status) {
      const resident = await findUserById(existing.user_id);
      await emailService.sendStatusUpdate(resident, complaint, note);
    }

    res.json({ complaint });
  } catch (err) { next(err); }
};

exports.flagOverdue = async (req, res, next) => {
  try {
    const { is_overdue } = req.body;
    const complaint = await markOverdue(req.params.id, is_overdue);
    res.json({ complaint });
  } catch (err) { next(err); }
};

exports.getHistory = async (req, res, next) => {
  try {
    const history = await getComplaintHistory(req.params.id);
    res.json({ history });
  } catch (err) { next(err); }
};

exports.detectOverdue = async (req, res, next) => {
  try {
    const overdueDays = parseInt(process.env.OVERDUE_DAYS || '7');
    const overdueComplaints = await getOverdueComplaints(overdueDays);
    for (const complaint of overdueComplaints) {
      if (!complaint.is_overdue) await markOverdue(complaint.id, true);
    }
    res.json({ message: 'Processed ' + overdueComplaints.length + ' overdue complaints.', count: overdueComplaints.length });
  } catch (err) { next(err); }
};
