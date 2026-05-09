const VoiceVerificationService = require('./elevenlabs/voice.service');
const FraudService = require('./snowflake/fraud.service');
const MemoryService = require('./backboard/memory.service');
const RiskEngine = require('./riskEngine');

/**
 * Controller managing Sponsor Integration workflows.
 * Centralizes cross-cutting concerns like logging to Snowflake/Backboard.io.
 */

const verifyProof = async (req, res) => {
    try {
        const { userId, signals } = req.body;
        
        if (!userId || !signals) {
            return res.status(400).json({ error: 'userId and signals are required' });
        }

        // 1. Analyze risk signals via Risk Engine
        const { riskScore, riskLevel, triggeredSignals } = RiskEngine.analyzeVerificationRisk(signals);
        
        // 2. Backbone.io Immutable Logging (audit trail)
        MemoryService.logEvent('ZKP_VERIFICATION_REQUESTED', userId, { riskScore, riskLevel, signals: triggeredSignals });

        // 3. Trigger conditions
        if (riskLevel === 'HIGH') {
            // Trigger voice challenge
            return res.status(200).json({
                action: 'REQUIRE_VOICE_LIVENESS',
                riskScore,
                riskLevel,
                triggeredSignals,
                message: 'Risk Engine flagged request. Voice Liveness verification required.'
            });
        } else {
            // Low/Medium risk: Verification proceeds normally
            MemoryService.logEvent('ZKP_VERIFICATION_SUCCESS', userId, { bypassedVoice: true });
            return res.status(200).json({
                action: 'VERIFICATION_SUCCESS',
                riskScore,
                riskLevel,
                triggeredSignals,
                message: 'Verification successful. ZK Proof accepted.'
            });
        }
    } catch (error) {
        console.error('Error verifying proof:', error);
        return res.status(500).json({ error: 'Failed to verify proof' });
    }
};

const generateChallenge = (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const challenge = VoiceVerificationService.generateChallenge(userId);
        
        return res.status(200).json({
            success: true,
            challenge,
            message: 'Please read this 4-digit code clearly.'
        });
    } catch (error) {
        console.error('Error generating challenge:', error);
        return res.status(500).json({ error: 'Failed to generate challenge' });
    }
};

const verifyAudio = async (req, res) => {
    try {
        const { userId, fallbackTranscript } = req.body;
        const file = req.file;

        if (!userId || !file) {
            return res.status(400).json({ error: 'userId and audio file are required' });
        }

        // Call ElevenLabs STT via Service
        const result = await VoiceVerificationService.verifyAudio(userId, file.buffer, file.mimetype, fallbackTranscript);

        // If verification fails, trigger Snowflake fraud alert and Backboard.io memory event
        if (!result.verified || result.riskScore > 50) {
            // [PART 2 INTEGRATION]
            FraudService.logFraudAlert('VOICE_VERIFICATION_FAILED', 'UNKNOWN_BANK', userId, result.riskScore);
            
            // [PART 3 INTEGRATION]
            MemoryService.logEvent('VOICE_VERIFICATION_FAILED', userId, { riskScore: result.riskScore });
            console.log(`[FRAUD ALERT] Voice verification failed for user ${userId}. Risk Score: ${result.riskScore}`);
        } else {
            // [PART 3 INTEGRATION]
            MemoryService.logEvent('VOICE_VERIFICATION_SUCCESS', userId, { riskScore: result.riskScore });
            console.log(`[AGENT MEMORY] Voice verification successful for user ${userId}.`);
        }

        return res.status(200).json({
            success: true,
            verified: result.verified,
            transcript: result.transcript,
            riskScore: result.riskScore
        });
    } catch (error) {
        console.error('Error verifying audio:', error);
        return res.status(500).json({ error: 'Internal server error during verification' });
    }
};

module.exports = {
    verifyProof,
    generateChallenge,
    verifyAudio
};
