const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Khai báo các điểm cuối API (Endpoints)
router.post('/', transactionController.createTransaction);
router.get('/', transactionController.getTransactions);

module.exports = router;