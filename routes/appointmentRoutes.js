const express = require("express");
const { bookAppointment, getDoctorSchedule, getAllAppointments } = require("../controllers/appointmentController");
const { authenticateUser } = require("../middleware/auth");
const router = express.Router();

// Book an appointment
router.post("/", authenticateUser, bookAppointment);

// Get all appointments (this must come before the dynamic route)
router.get("/all", authenticateUser, getAllAppointments);

// Get doctor's schedule
router.get("/:doctor_name", authenticateUser, getDoctorSchedule);

module.exports = router; 