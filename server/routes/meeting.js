const express = require('express');
const meetingController = require('../controllers/meetingController');

const router = express.Router();

// POST /api/meeting/calculate - Calculate best meeting point
router.post('/calculate', meetingController.calculateMeetingPoint);

module.exports = router;