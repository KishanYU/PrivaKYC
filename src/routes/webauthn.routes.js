const express = require('express');
const router = express.Router();
const { generateOptions, verifyRegistration } = require('../controllers/webauthn.controller');

// @route   POST /api/webauthn/generate-options
// @desc    Generate WebAuthn Registration Options (trigers Fingerprint/FaceID prompt on frontend)
router.post('/generate-options', generateOptions);

// @route   POST /api/webauthn/verify-registration
// @desc    Verify the WebAuthn response and save biometric credential
router.post('/verify-registration', verifyRegistration);

module.exports = router;
