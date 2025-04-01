const express = require('express');
const { sendEmail } = require('../utils/sendEmail');
const { authenticateUser } = require('../middleware/auth');
const router = express.Router();

router.post('/send', authenticateUser, sendEmail);

module.exports = router; 