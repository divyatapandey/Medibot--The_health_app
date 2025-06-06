const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const { Report } = require('../models/Report'); // Importing the Report model

//  multer to store files in memory
const upload = multer({ storage: multer.memoryStorage() });

// Analyze the report after uploading the file
async function analyzeReport(req, res) {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { originalname, buffer, mimetype } = req.file;
        const userEmail = req.user.email; // Get email from JWT token

        let extractedText = "";

        if (mimetype === "application/pdf") {
            const pdfData = await pdfParse(buffer);
            extractedText = pdfData.text;
        } else if (mimetype.startsWith("image/")) {
            const { data } = await Tesseract.recognize(buffer, "eng");
            extractedText = data.text;
        } else {
            return res.status(400).json({ message: "Unsupported file type" });
        }

        const analysisResult = {
            haemoglobin: analyzeHaemoglobin(extractedText),
            sugarLevel: analyzeSugarLevel(extractedText),
        };

        const newReport = new Report({
            filename: originalname,
            extractedText,
            analysis: analysisResult,
            email: userEmail,  // Use email from token
        });

        await newReport.save();

        res.json({
            message: "Analysis complete",
            reportId: newReport._id,
            analysis: analysisResult,
        });
    } catch (error) {
        console.error("Error processing report:", error);
        res.status(500).json({ message: "Error processing report", error: error.message });
    }
}

function analyzeHaemoglobin(text) {
    const regex = /Haemoglobin\s*[:]?\s*(\d+(\.\d+)?)/i;
    const match = text.match(regex);
    const haemoglobin = match ? parseFloat(match[1]) : null;

    if (haemoglobin !== null) {
        if (haemoglobin >= 12 && haemoglobin <= 16) {
            return { value: haemoglobin, message: "Haemoglobin level is optimal (for women)." };
        } else if (haemoglobin >= 13 && haemoglobin <= 18) {
            return { value: haemoglobin, message: "Haemoglobin level is optimal (for men)." };
        } else {
            return { value: haemoglobin, message: "Haemoglobin level is not optimal." };
        }
    } else {
        return { value: null, message: "Haemoglobin level not found." };
    }
}

// Example analysis function for sugar level
function analyzeSugarLevel(text) {
    // Adjust the regex to handle variations like "Blood Sugar: 95 mg/dL"
    const regex = /Blood\s*Sugar\s*[:\s]?\s*(\d+(\.\d+)?)/i;
    const match = text.match(regex);
    const sugarLevel = match ? parseFloat(match[1]) : null;

    // Check if the sugar level is within the optimal range (70 - 100 mg/dL)
    if (sugarLevel >= 70 && sugarLevel <= 100) {
        return { value: sugarLevel, message: "Blood sugar level is optimal." };
    } else if (sugarLevel !== null) {
        return { value: sugarLevel, message: "Blood sugar level is not optimal." };
    } else {
        return { value: null, message: "Blood sugar level not found." };
    }
}


module.exports = { upload, analyzeReport };
