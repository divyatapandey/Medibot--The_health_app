const express = require("express");
const { analyzeReport, upload } = require("../controllers/reportController");
const { addReminder, getUserReminders } = require("../controllers/medicineController");
const { authenticateUser } = require("../middleware/auth");

const router = express.Router();

//Route for adding reminders
router.post("/add-reminder", authenticateUser, addReminder);

//Route for getting all reminders for the authenticated user
router.get("/reminders", authenticateUser, getUserReminders);

//Route for uploading and analyzing the report
router.post("/upload-report", upload.single("report"), analyzeReport);

module.exports = router;
