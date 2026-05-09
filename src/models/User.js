const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true }, // Ties to Aadhaar flow session
    devices: [{
        credentialID: Buffer,
        credentialPublicKey: Buffer,
        counter: Number,
        transports: [String]
    }],
    currentChallenge: String
});

module.exports = mongoose.model('User', userSchema);
