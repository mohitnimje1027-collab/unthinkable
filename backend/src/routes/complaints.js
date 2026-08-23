const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  create, getMyComplaints, getAll, getOne,
  update, flagOverdue, getHistory, detectOverdue
} = require('../controllers/complaintController');

// Resident routes
router.post('/', authenticate, upload.single('photo'), create);
router.get('/my', authenticate, getMyComplaints);

// Admin routes
router.get('/', authenticate, requireAdmin, getAll);
router.post('/detect-overdue', authenticate, requireAdmin, detectOverdue);

// Shared (with access control inside)
router.get('/:id', authenticate, getOne);
router.get('/:id/history', authenticate, getHistory);

// Admin only
router.patch('/:id', authenticate, requireAdmin, update);
router.patch('/:id/overdue', authenticate, requireAdmin, flagOverdue);

module.exports = router;
