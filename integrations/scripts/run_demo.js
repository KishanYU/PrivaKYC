const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runDemo() {
    console.log("=====================================================");
    console.log("🚀 STARTING PRIVAKYC LIVE DEMO FOR JUDGES");
    console.log("=====================================================\n");

    try {
        // Step 1: User generates ZK Proof
        console.log("⏳ 1. User is converting their Aadhaar into a Zero-Knowledge Proof...");
        const zkResponse = await axios.post(`${BASE_URL}/zk/generate-proof`, {
            age: 26,
            state: 1
        });
        const { tokenId, proof, publicSignals } = zkResponse.data;
        console.log("✅ SUCCESS: Zero-Knowledge Proof Generated!");
        console.log(`🔑 Token ID (Nullifier): ${tokenId}\n`);

        // Step 2: Register on Blockchain
        console.log("⏳ 2. Anchoring identity to Algorand Blockchain...");
        const registerResponse = await axios.post(`${BASE_URL}/algorand/register-token`, {
            tokenId,
            proof
        });
        console.log("✅ SUCCESS: Token Active on Blockchain.");
        console.log(`📝 Bank storage record (Notice: ONLY HAShES, NO AADHAAR DATA!):`);
        console.log(registerResponse.data.storedData);
        console.log("\n");

        // Step 3: Bank Verifies the Identity
        console.log("⏳ 3. Bank is attempting to verify the user...");
        const verifyResponse1 = await axios.post(`${BASE_URL}/verifier/verify`, {
            tokenId,
            proof,
            publicSignals
        });
        console.log(`🏦 BANK SYSTEM: ${verifyResponse1.data.message}\n`);

        // Step 4: User Revokes Access
        console.log("⏳ 4. User clicked 'REVOKE ACCESS' on their phone...");
        const revokeResponse = await axios.post(`${BASE_URL}/algorand/revoke-token`, {
            tokenId
        });
        console.log(`🚨 REVOKED: ${revokeResponse.data.message}\n`);

        // Step 5: Bank Tries to Verify Again
        console.log("⏳ 5. Bank attempts verification AFTER revocation...");
        try {
            await axios.post(`${BASE_URL}/verifier/verify`, {
                tokenId,
                proof,
                publicSignals
            });
        } catch (error) {
            console.log(`❌ BANK SYSTEM REJECTED: ${error.response.data.message}`);
            console.log("✅ DPDP COMPLIANCE PROVEN: Bank instantly lost access.\n");
        }

        console.log("=====================================================");
        console.log("🎉 DEMO COMPLETE!");
        console.log("=====================================================");

    } catch (error) {
        console.error("Error during demo:", error.message);
    }
}

runDemo();
