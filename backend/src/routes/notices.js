const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { create, getAll, remove } = require('../controllers/noticeController');

router.get('/', authenticate, getAll);
router.post('/', authenticate, requireAdmin, create);
router.delete('/:id', authenticate, requireAdmin, remove);

module.exports = router;
