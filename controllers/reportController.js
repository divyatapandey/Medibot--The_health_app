const multer = require("multer");
const Report = require("../models/Report");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const fs = require("fs");
const path = require("path");

// Define Multer Storage (stores files in memory)
const upload = multer({ storage: multer.memoryStorage() });

// Export `upload` middleware
exports.upload = upload;

// Upload & Analyze Report
exports.analyzeReport = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { originalname, buffer, mimetype } = req.file;
        let extractedText = "";

        // Extract text from file
        if (mimetype === "application/pdf") {
            const pdfData = await pdfParse(buffer);
            extractedText = pdfData.text;
        } else if (mimetype.startsWith("image/")) {
            const tempPath = path.join(__dirname, `../uploads/${originalname}`);
            fs.writeFileSync(tempPath, buffer);
            const { data } = await Tesseract.recognize(tempPath, "eng");
            extractedText = data.text;
            fs.unlinkSync(tempPath); // Delete temp file
        } else {
            return res.status(400).json({ message: "Unsupported file type" });
        }

        // Analyze extracted text
        const analysisResult = {
            haemoglobin: analyzeHaemoglobin(extractedText),
            bloodPressure: analyzeBloodPressure(extractedText),
            sugarLevel: analyzeSugarLevel(extractedText),
        };

        // Save report details in MongoDB
        const newReport = new Report({
            filename: originalname,
            extractedText,
            analysis: analysisResult,
        });

        await newReport.save();

        res.json({
            message: "Analysis complete",
            reportId: newReport._id,
            analysis: analysisResult,
        });

    } catch (error) {
        res.status(500).json({ message: "Error processing report", error: error.message });
    }
};

// Extract Haemoglobin Level
function analyzeHaemoglobin(text) {
    const match = text.match(/Haemoglobin\s*[:=]?\s*(\d+(\.\d+)?)/i);
    if (match) {
        const level = parseFloat(match[1]);
        if (level < 12) return `Low (${level} g/dL)`;
        if (level > 16) return `High (${level} g/dL)`;
        return `Normal (${level} g/dL)`;
    }
    return "Haemoglobin level not found.";
}

// Extract Blood Pressure
function analyzeBloodPressure(text) {
    const match = text.match(/Blood Pressure\s*[:=]?\s*(\d{2,3})\/(\d{2,3})/i);
    if (match) {
        const systolic = parseInt(match[1]);
        const diastolic = parseInt(match[2]);
        if (systolic > 140 || diastolic > 90) return `High (${systolic}/${diastolic} mmHg)`;
        if (systolic < 90 || diastolic < 60) return `Low (${systolic}/${diastolic} mmHg)`;
        return `Normal (${systolic}/${diastolic} mmHg)`;
    }
    return "Blood Pressure not found.";
}

// Extract Sugar Level
function analyzeSugarLevel(text) {
    const match = text.match(/(Blood Sugar|Glucose)\s*[:=]?\s*(\d+(\.\d+)?)/i);
    if (match) {
        const level = parseFloat(match[2]);
        if (level < 70) return `Low (${level} mg/dL)`;
        if (level > 140) return `High (${level} mg/dL)`;
        return `Normal (${level} mg/dL)`;
    }
    return "Blood Sugar level not found.";
}
