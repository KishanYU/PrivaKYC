const express = require('express');
const voiceRoutes = require('./elevenlabs/voice.routes');

// Placeholders for future phases
const fraudRoutes = require('./snowflake/fraud.routes');
const memoryRoutes = require('./backboard/memory.routes');
const memoryMiddleware = require('./backboard/memory.middleware');

const router = express.Router();

// Apply Backboard.io Memory Middleware to all sponsor routes
router.use(memoryMiddleware);

/**
 * Main Sponsor Integration Router
 * Base Path: /api/sponsors
 */

// Phase 1: ElevenLabs Voice Verification
router.use('/voice', voiceRoutes);

// Phase 2: Snowflake Fraud Intelligence
router.use('/fraud', fraudRoutes);

// Phase 3: Backboard.io Agent Memory Layer
router.use('/memory', memoryRoutes);

// Main verification endpoint that triggers the Risk Engine
const sponsorController = require('./sponsor.controller');
router.post('/verify-proof', sponsorController.verifyProof);

module.exports = router;
