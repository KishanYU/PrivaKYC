const express = require('express');
const router = express.Router();
const { getAccessLogs } = require('../controllers/compliance.controller');

// @route   GET /api/compliance
// @desc    Returns comparison table data: Traditional KYC vs PrivaKYC
router.get('/', (req, res) => {
    const comparisonData = {
        traditional_kyc: {
            method: "Traditional KYC",
            dataStoredByBanks: "Raw Aadhaar, Biometrics, PII",
            privacyRisk: "Extremely High",
            revocationSupport: "None (Data is copied endlessly)",
            breachImpact: "Catastrophic (Identity Theft)",
            dpdpCompliance: "Fails (No data minimization)"
        },
        priva_kyc: {
            method: "PrivaKYC",
            dataStoredByBanks: "Cryptographic Hash, Nullifier ID",
            privacyRisk: "Zero Knowledge",
            revocationSupport: "Instant via Algorand Blockchain",
            breachImpact: "Zero (Hackers only get hashes)",
            dpdpCompliance: "100% Compliant",
            dataProvenance: "Auditor logs record every access"
        },
        message: "This data powers the compliance dashboard."
    };

    res.status(200).json({
        success: true,
        data: comparisonData
    });
});

// @route   GET /api/compliance/logs/:tokenId
// @desc    Get the data provenance access log
router.get('/logs/:tokenId', getAccessLogs);

module.exports = router;
