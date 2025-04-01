const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    extractedText: { type: String, required: true },
    analysis: { type: Object, required: true },
});

const Report = mongoose.model('Report', reportSchema);

module.exports = { Report };
