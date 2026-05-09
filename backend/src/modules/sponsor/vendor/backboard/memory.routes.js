const express = require('express');
const MemoryService = require('./memory.service');

const router = express.Router();

/**
 * @route GET /api/sponsors/memory/logs
 * @description Retrieves recent memory context logs (For demo / admin dashboard)
 */
router.get('/logs', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const logs = await MemoryService.getLogs(limit);

        return res.status(200).json({
            success: true,
            count: logs.length,
            data: logs
        });
    } catch (error) {
        console.error('Error fetching memory logs:', error);
        return res.status(500).json({ error: 'Internal system error' });
    }
});

module.exports = router;
