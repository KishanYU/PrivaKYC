const express = require('express');
const router = express.Router();
const multer = require('multer');
const { generateVoiceChallenge, verifyVoiceAudio } = require('../modules/sponsor');

const upload = multer({ storage: multer.memoryStorage() });

// @route POST /api/voice/challenge
router.post('/challenge', async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const challenge = generateVoiceChallenge(userId);

    res.status(200).json({
      success: true,
      challenge,
      message: 'Please read this 4-digit code clearly.',
    });
  } catch (error) {
    next(error);
  }
});

// @route POST /api/voice/verify
// Accepts either multipart file (`audio`) or base64 body (`audioBase64`) for compatibility.
router.post('/verify', upload.single('audio'), async (req, res, next) => {
  try {
    const { userId, fallbackTranscript, audioBase64 } = req.body;
    const file = req.file;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    let audioBuffer = null;
    let mimetype = 'audio/webm';

    if (file?.buffer) {
      audioBuffer = file.buffer;
      mimetype = file.mimetype || mimetype;
    } else if (audioBase64) {
      audioBuffer = Buffer.from(audioBase64, 'base64');
    }

    if (!audioBuffer) {
      return res.status(400).json({ success: false, message: 'audio file or audioBase64 is required' });
    }

    const result = await verifyVoiceAudio(userId, audioBuffer, mimetype, fallbackTranscript);

    res.status(200).json({
      success: true,
      verified: result.verified,
      transcript: result.transcript,
      riskScore: result.riskScore,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

