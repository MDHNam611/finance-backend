const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

router.get('/', transactionController.getTransactions);
router.post('/', transactionController.createTransaction);
router.post('/transfer', transactionController.transferMoney); // API Chuyển tiền
router.post('/sync', transactionController.syncOfflineData); // API Đồng bộ offline
router.put('/:id', transactionController.updateTransaction);
router.delete('/:id', transactionController.deleteTransaction); 

module.exports = router;