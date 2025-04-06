const MedicineReminder = require('../models/MedicineReminder');
const nodemailer = require('nodemailer');
const moment = require('moment');

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
        const currentHour = currentTime.format('HH:mm');

        // Get all reminders
        const reminders = await MedicineReminder.find({});

        for (const reminder of reminders) {
            // Check if today is in the reminder days
            if (reminder.days.includes(currentDay)) {
                const reminderTime = moment(reminder.time, 'HH:mm');
                const timeDiff = Math.abs(currentTime.diff(reminderTime, 'minutes'));

                // If the time difference is within 10 minutes
                if (timeDiff <= 10) {
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

                    await transporter.sendMail(mailOptions);
                    console.log(`Reminder sent to ${reminder.email} for ${reminder.medicineName}`);
                }
            }
        }

        res.status(200).json({ message: 'Reminders processed successfully' });
    } catch (error) {
        console.error('Error in sendReminders:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    sendReminders
}; 