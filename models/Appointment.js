const mongoose = require("mongoose");
const AppointmentSchema = new mongoose.Schema({
    doctorName: { 
        type: String, 
        required: true 
    },
    patientName: { 
        type: String, 
        required: true 
    },
    timeSlot: { 
        type: String, 
        required: true,
        validate: {
            validator: function(v) {
                // Validate time slot format (9:00-10:00, 10:00-11:00, etc.)
                return /^([0-9]|1[0-7]):00-([0-9]|1[0-8]):00$/.test(v);
            },
            message: props => `${props.value} is not a valid time slot!`
        }
    },
    date: {
        type: Date,
        required: true
    }
}, { timestamps: true });
// Compound index to prevent double booking
AppointmentSchema.index({ doctorName: 1, timeSlot: 1, date: 1 }, { unique: true });
module.exports = mongoose.model("Appointment", AppointmentSchema); 