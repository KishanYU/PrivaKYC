const express = require('express');
const router = express.Router();
const Token = require('../models/Token');

// @route   GET /api/tokens
// @desc    Get all active and revoked tokens (For Dashboard)
router.get('/', async (req, res, next) => {
    try {
        const tokens = await Token.find().select('-__v').sort({ createdAt: -1 });
        
        const activeTokens = tokens.filter(t => t.status === 'ACTIVE');
        const revokedTokens = tokens.filter(t => t.status === 'REVOKED');

        res.status(200).json({
            success: true,
            counts: {
                total: tokens.length,
                active: activeTokens.length,
                revoked: revokedTokens.length
            },
            tokens
        });
    } catch (error) {
        next(error);
    }
});

// @route   GET /api/tokens/:tokenId/status
// @desc    Lightweight status lookup for a specific token (used by frontend helper)
router.get('/:tokenId/status', async (req, res, next) => {
    try {
        const { tokenId } = req.params;

        if (!tokenId) {
            return res.status(400).json({ success: false, message: 'Missing Token ID' });
        }

        const token = await Token.findOne({ tokenId }).select('-__v');

        if (!token) {
            return res.status(404).json({ success: false, message: 'Token not found' });
        }

        res.status(200).json({
            success: true,
            tokenId: token.tokenId,
            status: token.status,
            registerTxId: token.registerTxId,
            revokeTxId: token.revokeTxId
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
