const express = require('express');
const router = express.Router();
const { getAuthUrl, handleCallback } = require('../controllers/digilocker.controller');

// Standard OIDC / OAuth2 endpoints for DigiLocker
router.get('/auth', getAuthUrl);
router.get('/callback', handleCallback);

module.exports = router;