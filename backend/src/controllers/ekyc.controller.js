const { sendOTP, verifyOTP } = require('../modules/ekyc');
const { generateZkProof } = require('../services/zk/zkService');
const { v4: uuidv4 } = require('uuid');
const Token = require('../models/Token');
const crypto = require('crypto');

// POST /api/ekyc/live/initiate
const initiateLiveKyc = async (req, res, next) => {
  try {
    const { aadhaarNumber } = req.body;

    if (!aadhaarNumber) {
      return res.status(400).json({ success: false, message: 'aadhaarNumber is required' });
    }

    console.log(`[eKYC] Initiating OTP for Aadhaar: ${aadhaarNumber.slice(0, 4)}********`);
    const otpResult = await sendOTP(aadhaarNumber);
    console.log(`[eKYC] OTP Provider: ${otpResult.provider}, Status: ${otpResult.success ? 'Success' : 'Failure'}`);

    return res.status(200).json({
      success: true,
      provider: otpResult.provider || (otpResult.success ? 'sandbox' : 'mock'),
      txnId: otpResult.txnId,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/ekyc/live/verify
const verifyLiveKyc = async (req, res, next) => {
  try {
    const { txnId, otp } = req.body;

    if (!txnId || !otp) {
      return res.status(400).json({ success: false, message: 'txnId and otp are required' });
    }

    const verification = await verifyOTP(txnId, otp);
    const kyc = verification.userData || verification.kyc || {};

    const dob = kyc.dob || '1990-01-01';
    const parts = dob.split('-');
    const birthYear = parts[0].length === 4 ? parseInt(parts[0], 10) : parseInt(parts[2], 10);
    const currentYear = new Date().getFullYear();

    const zkInput = {
      currentYear,
      ageThreshold: 18,
      birthYear,
    };

    const { proof, publicSignals } = await generateZkProof(zkInput);
    const tokenId = uuidv4();

    const proofHash = crypto.createHash('sha256').update(JSON.stringify(proof)).digest('hex');

    const newToken = new Token({
      tokenId,
      proofHash,
      status: 'ACTIVE',
    });

    await newToken.save();

    return res.status(200).json({
      success: true,
      provider: verification.provider,
      kyc: {
        name: kyc.name,
        dob,
        gender: kyc.gender,
        state: kyc.state,
      },
      zk: {
        tokenId,
        proof,
        publicSignals,
      },
      token: {
        status: 'ACTIVE',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiateLiveKyc,
  verifyLiveKyc,
};

