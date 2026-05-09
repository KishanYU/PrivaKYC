const express = require('express');
const router = express.Router();
const { getFraudHeatmap } = require('../modules/sponsor');

// @route   GET /api/fraud/heatmap
// @desc    Returns aggregated fraud heatmap data (mock if Snowflake not configured)
router.get('/heatmap', async (req, res, next) => {
  try {
    const { window } = req.query;
    // Support values like "24h", "60m", "15"
    const raw = String(window || '24h').toLowerCase().trim();
    let minutes = 60 * 24;
    if (raw.endsWith('h')) minutes = parseInt(raw.slice(0, -1), 10) * 60;
    else if (raw.endsWith('m')) minutes = parseInt(raw.slice(0, -1), 10);
    else if (/^\d+$/.test(raw)) minutes = parseInt(raw, 10);

    const data = await getFraudHeatmap(Number.isFinite(minutes) && minutes > 0 ? minutes : 60 * 24);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

