// Adopt Rakshitha's live sandbox module API, but keep our response shape stable.
// Source repo: `rakshitha-rr/PrivaKYCIdentity` (modules/ekyc)
const sandboxClient = require('./sandboxClient');

/**
 * Generate OTP for Aadhaar (sandbox live first, fallback if API unavailable)
 */
async function sendOTP(aadhaarNumber) {
  try {
    const response = await sandboxClient.post('/kyc/aadhaar/okyc/otp', {
      '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.otp.request',
      aadhaar_number: aadhaarNumber,
      consent: 'y',
      reason: 'For PrivaKYC KYC',
    });

    return {
      success: true,
      provider: 'sandbox',
      txnId: response.data.data?.reference_id || response.data.reference_id,
    };
  } catch (error) {
    // Fallback: demo-safe; never throw
    console.warn('[eKYC Fallback] OTP generation failed:', error.response?.data?.message || error.message);
    return {
      success: true,
      provider: 'mock',
      txnId: `demo-txn-${Date.now()}`,
    };
  }
}

/**
 * Verify OTP and extract safe user fields
 */
async function verifyOTP(txnId, otp) {
  try {
    const response = await sandboxClient.post('/kyc/aadhaar/okyc/otp/verify', {
      '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request',
      reference_id: txnId,
      otp,
    });

    const data = response.data.data || response.data;
    const poi = data.poi || {};
    const poa = data.poa || {};

    const userData = {
      name: poi.name || data.name || 'Unknown',
      dob: poi.dob || data.dob || '2000-01-01',
      gender: poi.gender || data.gender || undefined,
      state: poa.state || data.state || 'Unknown',
      pincode: poa.pc || poa.pincode || data.pincode || undefined,
    };

    // Claims intended for ZK logic (frontend/backend can choose what to display)
    const parts = String(userData.dob || '').split('-');
    const birthYear = parseInt(parts.length === 3 ? (parts[0].length === 4 ? parts[0] : parts[2]) : '2000', 10);
    const age = new Date().getFullYear() - (Number.isFinite(birthYear) ? birthYear : 2000);

    const zkClaims = {
      ageOver18: age >= 18,
      state_valid: userData.state !== 'Unknown',
    };

    return {
      success: true,
      provider: 'sandbox',
      userData: { ...userData, age },
      zkClaims,
    };
  } catch (error) {
    console.warn('[eKYC Fallback] OTP verification failed:', error.response?.data?.message || error.message);
    return {
      success: true,
      provider: 'mock',
      userData: {
        name: 'Demo User',
        dob: '2003-08-15',
        gender: 'M',
        state: 'Karnataka',
        pincode: '560001',
        age: 22,
      },
      zkClaims: { ageOver18: true, state_valid: true },
    };
  }
}

/**
 * Fetch Aadhaar XML from DigiLocker (structure ready; fallback returns sample XML)
 */
async function fetchAadhaarXMLFromDigiLocker(consentArtifact) {
  try {
    // Real implementation would call a DigiLocker fetch endpoint here.
    // Keeping logs minimal (no raw consent artifacts).
    await new Promise((resolve) => setTimeout(resolve, 300));

    const mockXml = `<?xml version="1.0" encoding="UTF-8"?>
<OfflinePaperlessKyc referenceId="123456789">
  <UidData>
    <Poi name="John Doe" dob="1990-01-01" gender="M"/>
    <Poa state="Karnataka" pc="560001"/>
  </UidData>
</OfflinePaperlessKyc>`;

    return {
      success: true,
      provider: 'mock',
      xmlString: mockXml,
    };
  } catch (error) {
    return { success: false, provider: 'digilocker', error: error.message };
  }
}

module.exports = {
  sendOTP,
  verifyOTP,
  fetchAadhaarXMLFromDigiLocker,
};

