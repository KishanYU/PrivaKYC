const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { fetchAadhaarXMLFromDigiLocker } = require('../modules/ekyc');

// IN A REAL STARTUP: These come from your approved DigiLocker Developer Portal
const DIGILOCKER_CLIENT_ID = process.env.DIGILOCKER_CLIENT_ID || "";
const DIGILOCKER_CLIENT_SECRET = process.env.DIGILOCKER_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.REDIRECT_URI || "http://localhost:5000/api/digilocker/callback";
const hasRealDigiLockerCredentials =
    DIGILOCKER_CLIENT_ID &&
    !DIGILOCKER_CLIENT_ID.includes('mock') &&
    !DIGILOCKER_CLIENT_ID.includes('hackathon') &&
    DIGILOCKER_CLIENT_SECRET &&
    !DIGILOCKER_CLIENT_SECRET.includes('mock') &&
    !DIGILOCKER_CLIENT_SECRET.includes('hackathon');

// @route   GET /api/digilocker/auth
// @desc    Generates the DigiLocker OAuth2 login URL
const getAuthUrl = (req, res, next) => {
    try {
        // Generate a secure state token to prevent CSRF attacks
        const state = crypto.randomBytes(16).toString('hex');

        if (!hasRealDigiLockerCredentials) {
            return res.status(200).json({
                success: true,
                demoMode: true,
                authUrl: null,
                message: 'DigiLocker developer credentials are not configured. Using the local proof flow for this demo.',
                state,
            });
        }

        // This is the actual URL structure for India's DigiLocker OAuth integration
        const authUrl = `https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize?response_type=code&client_id=${DIGILOCKER_CLIENT_ID}&state=${state}&redirect_uri=${REDIRECT_URI}`;

        res.status(200).json({
            success: true,
            authUrl,
            state
        });
    } catch (error) {
        next(error);
    }
};

// @route   GET /api/digilocker/callback
// @desc    Handles the redirect from DigiLocker, exchanges code for access token
const handleCallback = async (req, res, next) => {
    try {
        const { code, state } = req.query;

        if (!code) {
            return res.status(400).json({ success: false, message: "Authorization code missing from DigiLocker output." });
        }

        console.log(`[DigiLocker OIDC] Exchanging auth code: ${code} for Access Token...`);

        // IN PRODUCTION: We would do an axios.post() to https://digilocker.meripehchaan.gov.in/public/oauth2/1/token
        // For the Hackathon, we simulate the Government's JWT response to avoid the 3-month wait for real API keys.
        
        const mockDigiLockerToken = jwt.sign({
            sub: "mock_uidai_uuid_12345",
            name: "Demo User",
            dob: "1990-01-01",
            gender: "M",
            iss: "digilocker.gov.in"
        }, "mock_gov_secret", { expiresIn: '1h' });

        // Attempt to fetch (or simulate) the official Aadhaar XML so the existing XML/ZK pipeline can be reused.
        const xmlResult = await fetchAadhaarXMLFromDigiLocker({ code, state });

        // We instantly take the DigiLocker data and route it straight to our ZK Proof Generator
        // so that the Bank/Database STILL never sees the raw data! Data minimization at its best!
        res.status(200).json({
            success: true,
            message: "DigiLocker Authentication Successful",
            accessToken: mockDigiLockerToken,
            nextStep: "/api/zk/generate-proof",
            extractedData: {
                name: "Demo User",
                dob: "1990-01-01"
            },
            aadhaarXml: xmlResult?.xml || null,
            provider: xmlResult?.provider || 'mock'
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAuthUrl,
    handleCallback
};