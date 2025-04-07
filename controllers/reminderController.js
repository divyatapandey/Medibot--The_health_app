const MedicineReminder = require('../models/MedicineReminder');
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');

// Set the timezone to IST (Indian Standard Time)
moment.tz.setDefault('Asia/Kolkata');

// Create email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendReminders = async (req, res) => {
    try {
        const currentTime = moment();
        const currentDay = currentTime.format('dddd');
        
        console.log(`\n[REMINDER CHECK] Starting at: ${currentTime.format('YYYY-MM-DD HH:mm:ss')}`);
        console.log(`[REMINDER CHECK] Current Day: ${currentDay}`);
        console.log(`[REMINDER CHECK] Current Time: ${currentTime.format('HH:mm')}`);

        // Get all reminders
        const reminders = await MedicineReminder.find({});
        console.log(`[REMINDER CHECK] Found ${reminders.length} total reminders`);

        for (const reminder of reminders) {
            console.log('\n----------------------------------------');
            console.log(`[REMINDER] Processing reminder:`);
            console.log(`- Email: ${reminder.email}`);
            console.log(`- Medicine: ${reminder.medicineName}`);
            console.log(`- Scheduled Time: ${reminder.time}`);
            console.log(`- Days: ${reminder.days.join(', ')}`);
            console.log(`- Last Reminder Sent: ${reminder.lastReminderSent ? moment(reminder.lastReminderSent).format('YYYY-MM-DD HH:mm:ss') : 'Never'}`);

            // Check if today is in the reminder days
            if (reminder.days.includes(currentDay)) {
                console.log(`[REMINDER] ✓ Today (${currentDay}) is a reminder day`);
                
                // Get reminder time for today
                const reminderTime = moment(reminder.time, 'HH:mm');
                reminderTime.set({
                    year: currentTime.year(),
                    month: currentTime.month(),
                    date: currentTime.date()
                });

                console.log(`[REMINDER] Reminder time today: ${reminderTime.format('YYYY-MM-DD HH:mm:ss')}`);
                console.log(`[REMINDER] Current time: ${currentTime.format('YYYY-MM-DD HH:mm:ss')}`);

                // Calculate time difference in minutes
                const timeDiff = Math.abs(currentTime.diff(reminderTime, 'minutes'));
                console.log(`[REMINDER] Time difference: ${timeDiff} minutes`);

                // Check if the reminder time falls within the last 10 minutes window
                if (timeDiff <= 10) {
                    console.log('[REMINDER] ✓ Within 10-minute window');

                    // Check if we haven't already sent a reminder in this time window
                    const lastReminderSent = reminder.lastReminderSent ? moment(reminder.lastReminderSent) : moment(0);
                    const timeSinceLastReminder = Math.abs(currentTime.diff(lastReminderSent, 'minutes'));

                    console.log(`[REMINDER] Time since last reminder: ${timeSinceLastReminder} minutes`);

                    if (timeSinceLastReminder >= 10) {
                        console.log('[REMINDER] ✓ Enough time has passed since last reminder');
                        console.log('[REMINDER] Sending email...');
                        
                        // Send email reminder
                        const mailOptions = {
                            from: process.env.EMAIL_USER,
                            to: reminder.email,
                            subject: 'Medicine Reminder',
                            html: `
                                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                                    <h2 style="color: #2c3e50;">Medicine Reminder</h2>
                                    <p>Hello,</p>
                                    <p>This is a reminder to take your medicine:</p>
                                    <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                        <p><strong>Medicine:</strong> ${reminder.medicineName}</p>
                                        <p><strong>Dosage:</strong> ${reminder.dosage}</p>
                                        <p><strong>Time:</strong> ${reminder.time}</p>
                                    </div>
                                    <p>Please take your medicine as prescribed.</p>
                                    <p>Best regards,<br>Your Healthcare Team</p>
                                </div>
                            `
                        };

                        try {
                            await transporter.sendMail(mailOptions);
                            console.log('[REMINDER] ✓ Email sent successfully');
                            
                            // Update the last reminder sent time
                            reminder.lastReminderSent = new Date();
                            await reminder.save();
                            console.log('[REMINDER] ✓ Updated lastReminderSent timestamp');
                        } catch (emailError) {
                            console.error('[REMINDER] ✗ Error sending email:', emailError.message);
                            throw emailError;
                        }
                    } else {
                        console.log(`[REMINDER] ✗ Skipping - last reminder sent ${timeSinceLastReminder} minutes ago`);
                    }
                } else {
                    console.log('[REMINDER] ✗ Outside 10-minute window');
                }
            } else {
                console.log(`[REMINDER] ✗ Today (${currentDay}) is not a reminder day`);
            }
            console.log('----------------------------------------\n');
        }

        res.status(200).json({ 
            message: 'Reminders processed successfully',
            processedAt: currentTime.format('YYYY-MM-DD HH:mm:ss'),
            totalReminders: reminders.length
        });
    } catch (error) {
        console.error('[ERROR] Error in sendReminders:', error);
        res.status(500).json({ 
            error: 'Internal server error',
            message: error.message 
        });
    }
};

module.exports = {
    sendReminders
}; 