const MedicineReminder = require('../models/MedicineReminder');
const nodemailer = require('nodemailer');
const moment = require('moment-timezone');

// Set the timezone to IST (Indian Standard Time)
moment.tz.setDefault('Asia/Kolkata');

// Verify email configuration
console.log('[EMAIL CONFIG] Checking email configuration...');
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('[EMAIL CONFIG] ❌ Missing email credentials!');
    console.error('[EMAIL CONFIG] EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not Set');
    console.error('[EMAIL CONFIG] EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'Not Set');
} else {
    console.log('[EMAIL CONFIG] ✓ Email credentials are set');
}

// Create email transporter with debug logging
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true, // Enable debug logging
    logger: true // Enable logger
});

// Verify transporter connection
transporter.verify(function(error, success) {
    if (error) {
        console.error('[EMAIL CONFIG] ❌ Transporter verification failed:', error);
    } else {
        console.log('[EMAIL CONFIG] ✓ Transporter is ready to send emails');
    }
});

const sendReminderEmail = async (reminder) => {
    try {
        console.log(`[EMAIL] Attempting to send email to: ${reminder.email}`);
        
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

        console.log('[EMAIL] Mail options prepared:', {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject
        });

        const info = await transporter.sendMail(mailOptions);
        console.log('[EMAIL] ✓ Email sent successfully:', info.response);
        return true;
    } catch (error) {
        console.error('[EMAIL] ❌ Error sending email:', error.message);
        console.error('[EMAIL] Error details:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        throw error;
    }
};

const sendReminders = async (req, res) => {
    try {
        const currentTime = moment().tz('Asia/Kolkata').format('HH:mm');
        const currentDay = moment().tz('Asia/Kolkata').format('dddd');
        
        console.log('\n[REMINDER CHECK] ==========================================');
        console.log(`[REMINDER CHECK] Current time: ${currentTime}`);
        console.log(`[REMINDER CHECK] Current day: ${currentDay}`);
        
        // Find all reminders
        const reminders = await MedicineReminder.find({});
        console.log(`[REMINDER CHECK] Found ${reminders.length} total reminders in database`);
        
        for (const reminder of reminders) {
            console.log(`\n[REMINDER CHECK] Processing reminder for ${reminder.email}:
                - Medicine: ${reminder.medicineName}
                - Scheduled time: ${reminder.time}
                - Days: ${reminder.days.join(', ')}`);

            // Check if today is in the reminder days
            if (reminder.days.includes(currentDay)) {
                console.log(`[REMINDER CHECK] ✓ Today (${currentDay}) is a reminder day`);
                
                // Get current time and reminder time in minutes
                const [currentHour, currentMinute] = currentTime.split(':').map(Number);
                const [reminderHour, reminderMinute] = reminder.time.split(':').map(Number);
                
                const currentTimeInMinutes = currentHour * 60 + currentMinute;
                const reminderTimeInMinutes = reminderHour * 60 + reminderMinute;
                
                // Calculate time difference
                const timeDiff = Math.abs(currentTimeInMinutes - reminderTimeInMinutes);
                console.log(`[REMINDER CHECK] Time difference: ${timeDiff} minutes`);
                
                // If time difference is within 10 minutes, send reminder
                if (timeDiff <= 10) {
                    console.log(`[REMINDER CHECK] ✓ Within 10-minute window, sending reminder`);
                    try {
                        await sendReminderEmail(reminder);
                        reminder.lastReminderSent = new Date();
                        await reminder.save();
                        console.log(`[REMINDER CHECK] ✓ Reminder sent and timestamp updated`);
                    } catch (emailError) {
                        console.error(`[REMINDER CHECK] ❌ Failed to send email to ${reminder.email}:`, emailError.message);
                    }
                } else {
                    console.log(`[REMINDER CHECK] ✗ Outside 10-minute window`);
                }
            } else {
                console.log(`[REMINDER CHECK] ✗ Today (${currentDay}) is not a reminder day`);
            }
        }

        console.log('[REMINDER CHECK] ==========================================\n');
        res.status(200).json({
            success: true,
            message: 'Reminders processed',
            currentTime,
            currentDay,
            totalReminders: reminders.length
        });
    } catch (error) {
        console.error('[REMINDER CHECK] Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing reminders',
            error: error.message
        });
    }
};

module.exports = {
    sendReminders
}; 