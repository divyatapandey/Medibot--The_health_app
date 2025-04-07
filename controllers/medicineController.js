const MedicineReminder = require("../models/MedicineReminder");
const { sendEmail } = require("../utils/sendEmail");

exports.addReminder = async (req, res) => {
    try {
        // Get email from the authenticated user (from token)
        if (!req.user || !req.user.email) {
            return res.status(401).json({
                message: "Authentication required",
                code: "AUTH_REQUIRED"
            });
        }
        const userEmail = req.user.email;

        const { medicineName, dosage, time, days } = req.body;

        // Validate required fields
        if (!medicineName || !dosage || !time || !Array.isArray(days) || days.length === 0) {
            return res.status(400).json({ 
                message: "All fields are required. Days must be a non-empty array.",
                code: "MISSING_FIELDS"
            });
        }

        // Validate time format (HH:MM)
        if (!/^\d{2}:\d{2}$/.test(time)) {
            return res.status(400).json({
                message: "Invalid time format. Please use HH:MM format (e.g., 09:22)",
                code: "INVALID_TIME_FORMAT"
            });
        }

        // Parse hours and minutes
        const [hours, minutes] = time.split(':').map(Number);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            return res.status(400).json({
                message: "Invalid time values. Hours must be 00-23 and minutes must be 00-59",
                code: "INVALID_TIME_VALUES"
            });
        }

        // Validate days
        const validDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const invalidDays = days.filter(day => !validDays.includes(day));
        if (invalidDays.length > 0) {
            return res.status(400).json({
                message: `Invalid day names: ${invalidDays.join(', ')}`,
                code: "INVALID_DAYS"
            });
        }

        // Save reminder to MongoDB
        const reminder = new MedicineReminder({ 
            email: userEmail,
            medicineName, 
            dosage, 
            time, 
            days 
        });
        await reminder.save();

        // Create a fake req/res to pass to sendEmail
        const mockReq = {
            body: {
                to: userEmail,
                subject: "Medicine Reminder Set Successfully!",
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #2c3e50;">Medicine Reminder Created</h2>
                        <p>Hello,</p>
                        <p>Your medicine reminder has been set successfully:</p>
                        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <p><strong>Medicine:</strong> ${medicineName}</p>
                            <p><strong>Dosage:</strong> ${dosage}</p>
                            <p><strong>Time:</strong> ${time}</p>
                            <p><strong>Days:</strong> ${days.join(", ")}</p>
                        </div>
                        <p>You will receive reminders at the specified time on the selected days.</p>
                        <p>Best regards,<br>Your Healthcare Team</p>
                    </div>
                `
            }
        };

        // Fake res with status and json methods
        const mockRes = {
            status: (code) => ({
                json: (data) => console.log(`Mock email response [${code}]:`, data)
            })
        };

        await sendEmail(mockReq, mockRes);

        res.status(201).json({ 
            message: "Reminder added successfully and confirmation email sent!",
            reminder: {
                id: reminder._id,
                medicineName,
                dosage,
                time,
                days,
                createdAt: reminder.createdAt
            }
        });
    } catch (error) {
        console.error("Error in addReminder:", error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                message: "Validation error",
                errors: Object.values(error.errors).map(err => err.message),
                code: "VALIDATION_ERROR"
            });
        }
        res.status(500).json({ 
            message: "Internal server error",
            code: "SERVER_ERROR"
        });
    }
};

exports.getUserReminders = async (req, res) => {
    try {
        // Get email from the authenticated user (from token)
        const userEmail = req.user.email;

        // Find all reminders for this user
        const reminders = await MedicineReminder.find({ email: userEmail })
            .sort({ createdAt: -1 }); // Sort by most recent first

        res.status(200).json({
            message: "Reminders fetched successfully",
            reminders
        });
    } catch (error) {
        console.error("Error in getUserReminders:", error);
        res.status(500).json({ 
            message: "Internal server error",
            code: "SERVER_ERROR"
        });
    }
};

// Get all reminders for a user
exports.getAllReminders = async (req, res) => {
    try {
        // Get email from the authenticated user (from token)
        const userEmail = req.user.email;

        // Find all reminders for this user
        const reminders = await MedicineReminder.find({ email: userEmail })
            .select('-__v')
            .sort({ createdAt: -1 }); // Sort by most recent first

        res.status(200).json({
            message: "Reminders fetched successfully",
            reminders,
            count: reminders.length
        });
    } catch (error) {
        console.error("Error in getAllReminders:", error);
        res.status(500).json({
            message: "Internal server error",
            code: "SERVER_ERROR"
        });
    }
};
