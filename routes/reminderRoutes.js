const express = require('express');
const router = express.Router();
const { sendReminders } = require('../controllers/reminderController');

router.post('/send-reminders', sendReminders);

module.exports = router; 