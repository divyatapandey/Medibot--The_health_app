const mongoose = require("mongoose");

const MedicineReminderSchema = new mongoose.Schema({
    email: { type: String, required: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    time: { type: String, required: true }, // Ensure correct format HH:MM
    days: { type: [String], required: true } // Example: ["Monday", "Wednesday"]
}, { timestamps: true });

module.exports = mongoose.model("MedicineReminder", MedicineReminderSchema);
