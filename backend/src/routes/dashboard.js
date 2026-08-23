const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getStats } = require('../controllers/dashboardController');

router.get('/', authenticate, requireAdmin, getStats);

module.exports = router;
