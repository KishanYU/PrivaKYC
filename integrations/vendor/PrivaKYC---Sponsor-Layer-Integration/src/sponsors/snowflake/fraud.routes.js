const express = require('express');
const FraudService = require('./fraud.service');

const router = express.Router();

/**
 * @route POST /api/sponsors/fraud/log
 * @description Logs a new fraud alert to Snowflake
 * Expected body:
 * - alertType (string)
 * - bankId (string)
 * - nullifierHash (string)
 * - riskScore (number)
 */
router.post('/log', async (req, res) => {
    try {
        const { alertType, bankId, nullifierHash, riskScore } = req.body;

        if (!alertType || !nullifierHash) {
            return res.status(400).json({ error: 'alertType and nullifierHash are required' });
        }

        const record = await FraudService.logFraudAlert(alertType, bankId, nullifierHash, riskScore);

        return res.status(200).json({
            success: true,
            message: 'Fraud alert logged successfully',
            data: record
        });
    } catch (error) {
        console.error('Error logging fraud alert:', error);
        // Fallback safety: do not crash or return 500 if possible
        return res.status(500).json({ error: 'Internal system error' });
    }
});

/**
 * @route GET /api/sponsors/fraud/heatmap
 * @description Retrieves a heatmap of recent fraud activity
 * Query params:
 * - minutes (number, default: 60)
 */
router.get('/heatmap', async (req, res) => {
    try {
        const minutes = parseInt(req.query.minutes) || 60;
        
        const heatmapData = await FraudService.getFraudHeatmap(minutes);

        return res.status(200).json({
            success: true,
            ...heatmapData
        });
    } catch (error) {
        console.error('Error fetching fraud heatmap:', error);
        return res.status(500).json({ error: 'Internal system error' });
    }
});

module.exports = router;
