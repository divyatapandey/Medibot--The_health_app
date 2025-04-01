const mongoose = require("mongoose");

const MedicineReminderSchema = new mongoose.Schema({
    email: { type: String, required: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    time: { type: String, required: true },
    days: { type: [String], required: true } 
}, { timestamps: true });

module.exports = mongoose.model("MedicineReminder", MedicineReminderSchema);
