const express = require('express');
const { sendEmailHandler } = require('../utils/sendEmail');
const { authenticateUser } = require('../middleware/auth');
const router = express.Router();

router.post('/send', authenticateUser, sendEmailHandler);

module.exports = router; 