const MedicineReminder = require("../models/MedicineReminder");
const sendEmail = require("../utils/sendEmail"); // Import email function

exports.addReminder = async (req, res) => {
    try {
        console.log("Received Reminder Data:", req.body); // Debugging log

        const { email, medicineName, dosage, time, days } = req.body;
        if (!email || !medicineName || !dosage || !time || !days.length) {
            return res.status(400).json({ message: "All fields are required." });
        }

        //Saved reminder in MongoDB
        const reminder = new MedicineReminder({ email, medicineName, dosage, time, days });
        await reminder.save();

        // Sent email confirmation
        const subject = "Medicine Reminder Set Successfully!";
        const text = `Hello, your reminder for ${medicineName} (${dosage}) at ${time} on ${days.join(", ")} has been set.`;
        await sendEmail(email, subject, text);

        res.status(201).json({ message: "Reminder added successfully and email sent!" });
    } catch (error) {
        console.error(" Error in addReminder:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
