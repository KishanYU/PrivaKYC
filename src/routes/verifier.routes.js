const express = require('express');
const router = express.Router();
const { verifyProof } = require('../controllers/verifier.controller');

router.post('/verify', verifyProof);

module.exports = router;
