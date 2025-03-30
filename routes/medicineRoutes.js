const express = require("express");
const { analyzeReport, upload } = require("../controllers/reportController");
const { addReminder } = require("../controllers/medicineController");

const router = express.Router();

router.post("/add-reminder", addReminder);

// ✅ Use the `upload` middleware from reportController.js
router.post("/upload-report", upload.single("report"), analyzeReport);

module.exports = router;
