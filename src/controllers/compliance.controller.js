const AccessLog = require('../models/AccessLog');

const getAccessLogs = async (req, res, next) => {
    try {
        const { tokenId } = req.params;

        if (!tokenId) {
            return res.status(400).json({ success: false, message: 'Missing Token ID' });
        }

        // Fetch logs from MongoDB, sort by newest first
        const logs = await AccessLog.find({ tokenId }).sort({ timestamp: -1 });

        return res.status(200).json({
            success: true,
            totalChecks: logs.length,
            logs
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAccessLogs
};