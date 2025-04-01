const express = require("express");
const { analyzeReport, upload } = require("../controllers/reportController");
const { addReminder } = require("../controllers/medicineController");

const router = express.Router();

// Route for adding reminders
router.post("/add-reminder", addReminder);

// Route for uploading and analyzing the report
router.post("/upload-report", upload.single("report"), analyzeReport);

module.exports = router;
