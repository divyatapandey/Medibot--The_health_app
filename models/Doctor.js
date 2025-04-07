const mongoose = require("mongoose");
const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    specialization: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    imageUrl: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});
const Doctor = mongoose.model("Doctor", doctorSchema);
module.exports = Doctor;
