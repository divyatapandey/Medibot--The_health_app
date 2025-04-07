const mongoose = require("mongoose");

const MedicineReminderSchema = new mongoose.Schema({
    email: { type: String, required: true },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    time: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(v);
            },
            message: props => `${props.value} is not a valid time format! Use HH:MM format (e.g., 09:22).`
        }
    },
    days: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                return v.every(day => validDays.includes(day));
            },
            message: props => `${props.value} contains invalid day names!`
        }
    },
    lastReminderSent: {
        type: Date,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model("MedicineReminder", MedicineReminderSchema);
