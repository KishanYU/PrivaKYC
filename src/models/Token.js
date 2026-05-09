const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    tokenId: { type: String, required: true, unique: true },
    proofHash: { type: String, required: true },
    status: { type: String, enum: ['ACTIVE', 'REVOKED'], default: 'ACTIVE' },
    createdAt: { type: Date, default: Date.now },
    revocationKey: { type: String },
    recoveryHash: { type: String }, // Hashed 15-word phrase for emergency revocation
    registerTxId: { type: String },
    revokeTxId: { type: String }
});

module.exports = mongoose.model('Token', tokenSchema);
