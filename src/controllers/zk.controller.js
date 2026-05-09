const { v4: uuidv4 } = require('uuid');
const { generateZkProof } = require('../services/zk/zkService');

// @route   POST /api/zk/generate-proof
const generateProof = async (req, res, next) => {
    try {
        const { dob } = req.body;
        
        let birthYear = 2000;
        if (dob) {
            // Support formats YYYY-MM-DD or DD-MM-YYYY
            const parts = dob.split('-');
            birthYear = parts[0].length === 4 ? parseInt(parts[0]) : parseInt(parts[2]);
        }

        // Input payload exactly matching age_proof.circom
        const currentYear = new Date().getFullYear(); // 2026
        const zkInput = {
            currentYear: currentYear,
            ageThreshold: 18,
            birthYear: birthYear
        };

        // Generate TRUE mathematical snarkjs proof
        console.log(`ZKP Generation: Proving user born in ${birthYear} is over 18 in ${currentYear}`);
        const { proof, publicSignals } = await generateZkProof(zkInput);

        // Create Unique TokenId / Nullifier
        const tokenId = uuidv4();

        res.status(200).json({
            success: true,
            message: "Zero-Knowledge Proof generated successfully",
            tokenId,
            proof,
            publicSignals
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    generateProof
};
