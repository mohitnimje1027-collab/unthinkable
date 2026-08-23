const { createNotice, getAllNotices, deleteNotice } = require('../models/noticeModel');
const { getAllResidentEmails } = require('../models/userModel');
const emailService = require('../services/emailService');

exports.create = async (req, res, next) => {
  try {
    const { title, content, is_important } = req.body;
    const notice = await createNotice({
      title, content,
      is_important: is_important === true || is_important === 'true',
      created_by: req.user.id
    });
    if (notice.is_important) {
      const residents = await getAllResidentEmails();
      await emailService.sendImportantNotice(residents, notice);
    }
    res.status(201).json({ notice });
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const notices = await getAllNotices();
    res.json({ notices });
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await deleteNotice(req.params.id);
    res.json({ message: 'Notice deleted.' });
  } catch (err) { next(err); }
};
