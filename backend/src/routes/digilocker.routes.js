const express = require('express');
const router = express.Router();
const { getAuthUrl, handleCallback, verifyCode } = require('../controllers/digilocker.controller');

// Standard OIDC / OAuth2 endpoints for DigiLocker
router.get('/auth', getAuthUrl);
router.get('/callback', handleCallback);
router.get('/verify-code', verifyCode);

module.exports = router;