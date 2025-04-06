const express = require('express');
const { addDoctor, getAllDoctors } = require('../controllers/doctorController');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Protected route - requires authentication
router.post('/add', authenticateUser, addDoctor);

// Get all doctors
router.get('/all', getAllDoctors);

module.exports = router; 