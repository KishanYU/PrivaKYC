/* eslint-disable no-console */
const axios = require('axios');

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000/api';

async function main() {
  console.log('=== PrivaKYC end-to-end demo (mock-friendly) ===');

  try {
    // 1) Live e-KYC OTP initiate (mock-friendly)
    console.log('\n[1] Initiating live e-KYC OTP...');
    const initiateRes = await axios.post(`${BASE_URL}/ekyc/live/initiate`, {
      aadhaarNumber: '999988887777',
    });
    console.log('Initiate response:', initiateRes.data);

    const txnId = initiateRes.data.txnId;

    // 2) Verify OTP and generate ZK proof + token
    console.log('\n[2] Verifying OTP and generating ZK proof...');
    const verifyRes = await axios.post(`${BASE_URL}/ekyc/live/verify`, {
      txnId,
      otp: '000000',
    });
    console.log('Verify response (truncated):', {
      success: verifyRes.data.success,
      provider: verifyRes.data.provider,
      token: verifyRes.data.token,
    });

    const tokenId = verifyRes.data.zk.tokenId;
    const proof = verifyRes.data.zk.proof;
    const publicSignals = verifyRes.data.zk.publicSignals;

    // 3) Bank verifies proof
    console.log('\n[3] Bank verifier checking proof...');
    const bankRes = await axios.post(`${BASE_URL}/verifier/verify`, {
      tokenId,
      proof,
      publicSignals,
    });
    console.log('Bank verifier:', bankRes.data);

    // 4) Revoke token
    console.log('\n[4] Revoking token...');
    const revokeRes = await axios.post(`${BASE_URL}/algorand/revoke-token`, {
      tokenId,
    });
    console.log('Revoke response:', revokeRes.data);

    // 5) Try verification again (should fail or report revoked)
    console.log('\n[5] Verifying after revocation (should be denied)...');
    try {
      await axios.post(`${BASE_URL}/verifier/verify`, {
        tokenId,
        proof,
        publicSignals,
      });
    } catch (error) {
      console.log('Post-revocation verify rejected as expected:', error.response?.data || error.message);
    }

    console.log('\n=== Demo flow complete ===');
  } catch (error) {
    console.error('Demo failed:', error.response?.data || error.message);
    process.exitCode = 1;
  }
}

main();

