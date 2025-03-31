const express = require("express");
const { bookAppointment } = require("../controllers/appointmentController");
const { authenticateUser } = require("../middleware/auth");
const router = express.Router();

router.post("/book", authenticateUser, bookAppointment);

module.exports = router; 