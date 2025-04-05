const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    specialization: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    imageUrl: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Doctor", doctorSchema);
