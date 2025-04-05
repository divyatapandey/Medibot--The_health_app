const express = require('express');
const { addDoctor } = require('../controllers/doctorController');
const { authenticateUser } = require('../middleware/auth');

const router = express.Router();

// Protected route - requires authentication
router.post('/add', authenticateUser, addDoctor);

module.exports = router; 