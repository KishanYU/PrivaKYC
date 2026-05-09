const mongoose = require('mongoose');

const accessLogSchema = new mongoose.Schema({
    tokenId: {
        type: String,
        required: true,
        index: true
    },
    verifierName: {
        type: String,
        required: true,
        default: 'Unknown Verifier'
    },
    status: {
        type: String,
        enum: ['SUCCESS', 'REJECTED_REVOKED', 'FAILED_SIGNATURE'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    ipAddress: {
        type: String
    }
});

module.exports = mongoose.model('AccessLog', accessLogSchema);