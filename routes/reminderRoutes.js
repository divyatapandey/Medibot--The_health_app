const express = require('express');
const router = express.Router();
const { sendReminders , deleteUserReminders , deleteSpecificReminders} = require('../controllers/reminderController');


router.post('/send-reminders', sendReminders);
router.get('/del-user-reminders', deleteUserReminders);
router.get('/del-specific-reminders', deleteSpecificReminders);
module.exports = router; 