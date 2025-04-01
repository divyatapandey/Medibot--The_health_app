const mongoose = require("mongoose");

const MedicineReminderSchema = new mongoose.Schema({
    email: { type: String, required: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    time: { type: String, required: true }, //  HH:MM
    days: { type: [String], required: true } //["Monday", "Wednesday"]
}, { timestamps: true });

module.exports = mongoose.model("MedicineReminder", MedicineReminderSchema);
