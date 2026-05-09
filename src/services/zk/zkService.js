const snarkjs = require('snarkjs');
const path = require('path');
const fs = require('fs');

// In a real production setup, these would point to the compiled circom outputs:
// circuit.wasm, circuit_final.zkey, verification_key.json
const WASM_FILE = path.join(__dirname, '../../../build/age_proof_js/age_proof.wasm');
const ZKEY_FILE = path.join(__dirname, '../../../build/age_proof_final.zkey');
const VKEY_FILE = path.join(__dirname, '../../../build/verification_key.json');

/**
 * Generate ZK Proof using snarkjs
 * @param {Object} input - Private inputs representing user data
 */
const generateZkProof = async (input) => {
    try {
        // Fallback for hackathon demo if actual compiled circom files are missing
        if (!fs.existsSync(WASM_FILE) || !fs.existsSync(ZKEY_FILE)) {
            console.warn("⚠️ [ZK-SIMULATION] Circuit files not found. Simulating ZK proof generation for Demo purposes.");
            return {
                proof: {
                    protocol: "groth16",
                    curve: "bn128"
                },
                publicSignals: ["1"]
            };
        }

        // Real snarkjs proof generation
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, WASM_FILE, ZKEY_FILE);
        return { proof, publicSignals };
    } catch (error) {
         console.error("ZK Proof Generation Error:", error);
         throw new Error("Failed to generate ZK Proof");
    }
};

/**
 * Verify ZK Proof using snarkjs
 */
const verifyZkProof = async (publicSignals, proof) => {
    try {
        if (!fs.existsSync(VKEY_FILE)) {
             console.warn("⚠️ [ZK-SIMULATION] Verification key missing. Simulating ZK proof verification.");
             return publicSignals[0] === "1"; // Return true if simulator flagged age as valid
        }

        const vKey = JSON.parse(fs.readFileSync(VKEY_FILE, 'utf-8'));
        const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        return isValid;
    } catch (error) {
        console.error("ZK Proof Verification Error:", error);
        return false;
    }
};

module.exports = {
    generateZkProof,
    verifyZkProof
};
