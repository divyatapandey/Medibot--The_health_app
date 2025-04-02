const express = require("express");
const { bookAppointment, getDoctorSchedule } = require("../controllers/appointmentController");
const { authenticateUser } = require("../middleware/auth");
const router = express.Router();

// Book an appointment
router.post("/", authenticateUser, bookAppointment);

// Get doctor's schedule
router.get("/:doctor_name", authenticateUser, getDoctorSchedule);

module.exports = router; 