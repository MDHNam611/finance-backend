const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/link-account', authController.linkGoogleAccount);

module.exports = router;