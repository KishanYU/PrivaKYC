const express = require('express');
const multer = require('multer');
const { generateChallenge, verifyAudio } = require('../sponsor.controller');

const router = express.Router();

// Configure Multer for memory storage (Requirement: never store audio permanently)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * @route POST /api/sponsors/voice/challenge
 * @description Generates a random 4-digit challenge for voice liveness
 */
router.post('/challenge', generateChallenge);

/**
 * @route POST /api/sponsors/voice/verify
 * @description Accepts audio upload and verifies it against the challenge
 * Expected form-data:
 * - audio: The audio file blob
 * - userId: The session or user identifier
 */
router.post('/verify', upload.single('audio'), verifyAudio);

module.exports = router;
