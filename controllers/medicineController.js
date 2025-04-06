const MedicineReminder = require("../models/MedicineReminder");
const { sendEmail } = require("../utils/sendEmail");

exports.addReminder = async (req, res) => {
    try {
        console.log("Received Reminder Data:", req.body);

        const { email, medicineName, dosage, time, days } = req.body;
        if (!email || !medicineName || !dosage || !time || !days.length) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Save reminder to MongoDB
        const reminder = new MedicineReminder({ email, medicineName, dosage, time, days });
        await reminder.save();

        // Create a fake req/res to pass to sendEmail
        const mockReq = {
            body: {
                to: email,
                subject: "Medicine Reminder Set Successfully!",
                text: `Hello, your reminder for ${medicineName} (${dosage}) at ${time} on ${days.join(", ")} has been set.`
            }
        };

        // Fake res with status and json methods
        const mockRes = {
            status: (code) => ({
                json: (data) => console.log(`Mock email response [${code}]:`, data)
            })
        };

        await sendEmail(mockReq, mockRes);

        res.status(201).json({ message: "Reminder added successfully and email sent!" });
    } catch (error) {
        console.error("Error in addReminder:", error);
        res.status(500).json({ message: "Internal server error" });
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
