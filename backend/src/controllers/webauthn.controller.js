const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
} = require('@simplewebauthn/server');
const User = require('../models/User');

const rpName = 'PrivaKYC Demo';
const rpID = 'localhost'; // Should match the frontend domain in production
const origin = `http://${rpID}:5173`;

// Generate Registration Options
const generateOptions = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId required' });

        let user = await User.findOne({ userId });
        if (!user) {
            user = new User({ userId, devices: [] });
        }

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: user.userId,
            userName: user.userId,
            attestationType: 'none',
            authenticatorSelection: {
                residentKey: 'required',
                userVerification: 'preferred', // triggers biometrics (touchID, faceID)
            },
        });

        // Save challenge to DB to verify later
        user.currentChallenge = options.challenge;
        await user.save();

        res.status(200).json(options);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Verify Registration Response
const verifyRegistration = async (req, res) => {
    try {
        const { userId, body: credential } = req.body;
        if (!userId || !credential) return res.status(400).json({ error: 'userId and credential body required' });

        const user = await User.findOne({ userId });
        if (!user || !user.currentChallenge) {
            return res.status(400).json({ error: 'User or challenge not found' });
        }

        const verification = await verifyRegistrationResponse({
            response: credential,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        const { verified, registrationInfo } = verification;

        if (verified && registrationInfo) {
            const { credentialPublicKey, credentialID, counter } = registrationInfo;

            // Save the device
            user.devices.push({
                credentialID,
                credentialPublicKey,
                counter,
            });
            user.currentChallenge = undefined; // clear challenge
            await user.save();

            return res.status(200).json({ verified: true, message: 'Biometric bound successfully!' });
        }

        res.status(400).json({ verified: false, message: 'Verification failed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    generateOptions,
    verifyRegistration
};
