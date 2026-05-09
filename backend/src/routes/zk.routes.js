const express = require('express');
const router = express.Router();
const { generateProof } = require('../controllers/zk.controller');

// @route   POST /api/zk/generate-proof
// @desc    Generate ZK proof using snarkjs based on selective disclosure
router.post('/generate-proof', generateProof);

module.exports = router;
