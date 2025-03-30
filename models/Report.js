const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    fileId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference to GridFS file
    uploadedAt: { type: Date, default: Date.now },
    extractedText: { type: String },
    analysis: { 
        haemoglobin: String, 
        bloodPressure: String, 
        sugarLevel: String 
    },
});

module.exports = mongoose.model("Report", ReportSchema);
