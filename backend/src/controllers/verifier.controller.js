const { verifyZkProof } = require('../services/zk/zkService');
const Token = require('../models/Token');
const AccessLog = require('../models/AccessLog');
const crypto = require('crypto');
const { isTxnConfirmed } = require('../services/algorand/algorandService');
const { analyzeRisk, logToAuditTrail, logFraudAlert } = require('../modules/sponsor');

// @route   POST /api/verifier/verify
// @desc    Bank simulator endpoint to verify user identity silently
const verifyProof = async (req, res, next) => {
    try {
        const { tokenId, proof, publicSignals } = req.body;

        if (!tokenId || !proof || !publicSignals) {
            return res.status(400).json({ success: false, message: 'Missing verification components' });
        }

        const tokenRecord = await Token.findOne({ tokenId });
        if (!tokenRecord) {
            return res.status(404).json({ verified: false, message: "Token not registered on blockchain." });
        }

        // --- SPONSOR LAYER: ADAPTIVE RISK ANALYSIS ---
        const signals = {
            revokedProofReuse: tokenRecord.status === 'REVOKED',
            newDevice: req.headers['user-agent'] !== (tokenRecord.deviceBinding || req.headers['user-agent']),
            ipMismatch: false, // Could compare req.ip with tokenRecord IP history
            highFrequencyRequests: false, 
            repeatedVoiceFailure: false
        };

        const { riskScore, riskLevel, triggeredSignals } = analyzeRisk(signals);
        
        // Log Initial Request to Backbone.io
        await logToAuditTrail({
            type: 'ZKP_VERIFICATION_REQUESTED',
            userId: tokenId,
            riskScore,
            riskLevel,
            signals: triggeredSignals
        });

        if (riskLevel === 'HIGH') {
            // Trigger Snowflake Fraud Alert immediately
            await logFraudAlert('HIGH_RISK_VERIFICATION_ATTEMPT', req.body.verifierName || 'HDFC Bank', tokenId, riskScore);
            
            // Block ZKP verification and require Voice Liveness
            return res.status(403).json({
                verified: false,
                requiresVoiceChallenge: true,
                riskScore,
                riskLevel,
                message: "High risk detected. Voice Liveness Verification required before processing."
            });
        } else if (riskLevel === 'MEDIUM') {
            await logToAuditTrail({
                type: 'MEDIUM_RISK_WARNING',
                userId: tokenId,
                message: "Proceeding with caution"
            });
        }
        // --- END SPONSOR LAYER ---

        // 1. Verify ZK Proof Mathematically
        const isProofValid = await verifyZkProof(publicSignals, proof);
        if (!isProofValid) {
            return res.status(400).json({ 
                verified: false, 
                message: "Cryptographic Zero-Knowledge proof is invalid or corrupted." 
            });
        }

        // 2. Check Algorand Blockchain Status (already fetched above)

        // Optional real-chain check for non-demo transaction ids.
        const registerTxId = tokenRecord.registerTxId || tokenRecord.revocationKey;
        const hasRealRegisterTx = registerTxId && !registerTxId.startsWith('TX_ALGO_');
        if (process.env.INDEXER_SERVER && hasRealRegisterTx) {
            const confirmed = await isTxnConfirmed(registerTxId);
            if (!confirmed) {
                return res.status(503).json({
                    verified: false,
                    message: "Blockchain registration not yet confirmed. Please retry shortly."
                });
            }
        }

        if (tokenRecord.status === 'REVOKED') {
            await AccessLog.create({
                tokenId,
                verifierName: req.body.verifierName || 'HDFC Bank (Demo)',
                status: 'REJECTED_REVOKED',
                ipAddress: req.ip
            });
            // Rest of revoked logic 
            const revokeTxId = tokenRecord.revokeTxId;
            if (process.env.INDEXER_SERVER && revokeTxId && !revokeTxId.startsWith('REVOKE_TX_')) {
                const confirmed = await isTxnConfirmed(revokeTxId);
                if (!confirmed) {
                    return res.status(409).json({
                        verified: false,
                        revoked: true,
                        message: "Revocation pending confirmation on Algorand."
                    });
                }
            }
            return res.status(403).json({ 
                verified: false, 
                revoked: true,
                message: "IDENTITY REVOKED. Bank access denied via Algorand Registry." 
            });
        }

        // 3. Ensure Proof matches the registered hash
        const currentProofHash = crypto.createHash('sha256').update(JSON.stringify(proof)).digest('hex');
        if (currentProofHash !== tokenRecord.proofHash) {
            await AccessLog.create({
                tokenId,
                verifierName: req.body.verifierName || 'Bad Actor Bank',
                status: 'FAILED_SIGNATURE',
                ipAddress: req.ip
            });
            return res.status(400).json({ verified: false, message: "Proof hash mismatch. Potential tampering." });
        }

        // Success - Bank stores minimal record
        await AccessLog.create({
            tokenId,
            verifierName: req.body.verifierName || 'HDFC Bank (Demo)',
            status: 'SUCCESS',
            ipAddress: req.ip
        });

        // Log Final Success to Backboard
        await logToAuditTrail({
            type: 'ZKP_VERIFICATION_SUCCESS',
            userId: tokenId,
            bypassedVoice: riskLevel !== 'HIGH'
        });

        res.status(200).json({
            verified: true,
            revoked: false,
            message: "DPDP + PMLA compliant verification successful. Bank account authorized.",
            bankStorage: {
                tokenId: tokenRecord.tokenId,
                proofHash: tokenRecord.proofHash,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyProof
};
