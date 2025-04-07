const express = require('express');
const router = express.Router();
const { sendReminders , deleteUserReminders , deleteSpecificReminders} = require('../controllers/reminderController');


router.post('/send-reminders', sendReminders);
// DELETE all reminders for a user
router.delete('/reminders', deleteUserReminders); // uses req.user.email

// DELETE a specific reminder by ID
router.delete('/reminders/:id', deleteSpecificReminders); // uses req.params.id
module.exports = router; 