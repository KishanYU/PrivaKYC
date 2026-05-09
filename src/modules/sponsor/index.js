// Sponsor integration adopted from `jc-kirthi/PrivaKYC---Sponsor-Layer-Integration`
const VoiceVerificationService = require('./vendor/voice.service');
const FraudService = require('./vendor/fraud.service');
const MemoryService = require('./vendor/memory.service');

const verifyVoiceLiveness = async (userId, expectedNumber, audioBuffer, mimetype, fallbackTranscript) => {
  // Their service manages a stored challenge internally; we keep this helper for compatibility.
  // If expectedNumber is provided, we set the challenge by generating one and returning it separately.
  // The primary flow should use `generateVoiceChallenge` + `verifyVoiceAudio`.
  return VoiceVerificationService.verifyAudio(userId, audioBuffer, mimetype || 'audio/webm', fallbackTranscript);
};

const generateVoiceChallenge = (userId) => {
  return VoiceVerificationService.generateChallenge(userId);
};

const verifyVoiceAudio = async (userId, audioBuffer, mimetype, fallbackTranscript) => {
  return VoiceVerificationService.verifyAudio(userId, audioBuffer, mimetype, fallbackTranscript);
};

const logFraudAlert = async (alertType, bankId, nullifierHash, riskScore = 50) => {
  return FraudService.logFraudAlert(alertType, bankId, nullifierHash, riskScore);
};

const getFraudHeatmap = async (minutes = 60 * 24) => {
  return FraudService.getFraudHeatmap(minutes);
};

const logToAuditTrail = async (eventData) => {
  // Map to their MemoryService logEvent/logRequest shape.
  if (!eventData) return { provider: 'memory', logged: false };
  try {
    await MemoryService.logEvent(eventData.type || 'AUDIT_EVENT', eventData.userId || 'anonymous', eventData);
    return { provider: 'memory', logged: true };
  } catch (error) {
    console.warn('[sponsor] audit log failed:', error.message);
    return { provider: 'memory', logged: false };
  }
};

module.exports = {
  // voice
  generateVoiceChallenge,
  verifyVoiceAudio,
  verifyVoiceLiveness,
  // fraud
  logFraudAlert,
  getFraudHeatmap,
  // audit
  logToAuditTrail,
};

