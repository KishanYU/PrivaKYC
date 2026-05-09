const express = require('express');
const router = express.Router();
const { initiateLiveKyc, verifyLiveKyc } = require('../controllers/ekyc.controller');

// @route   POST /api/ekyc/live/initiate
// @desc    Send Aadhaar OTP via sandbox/Setu/mock
router.post('/ekyc/live/initiate', initiateLiveKyc);

// @route   POST /api/ekyc/live/verify
// @desc    Verify OTP and automatically generate ZK proof + register token
router.post('/ekyc/live/verify', verifyLiveKyc);

module.exports = router;

