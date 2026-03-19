const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/dashboard', reportController.getDashboardSummary);
router.get('/category-details', reportController.getCategoryDetails);

module.exports = router;