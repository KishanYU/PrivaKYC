const SetuClient = require('./setuClient');
const { extractClaims } = require('./utils');

const client = new SetuClient();

async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

async function initiate(aadhaarNumber) {
  if (process.env.USE_MOCK === 'true') {
    return { transactionId: 'mock-txn-123' };
  }
  try {
    const response = await retryWithBackoff(() =>
      client.request('POST', '/ekyc/init', { aadhaarNumber })
    );
    return { transactionId: response.data.transactionId };
  } catch (error) {
    throw new Error('Failed to initiate KYC: ' + error.message);
  }
}

async function verify(txnId, otp) {
  if (process.env.USE_MOCK === 'true') {
    const mockProfile = {
      aadhaar: {
        dateOfBirth: '2000-01-01',
        address: { state: 'Karnataka' },
        aadhaarNumber: 'XXXX1234'
      }
    };
    const claims = extractClaims(mockProfile, process.env.AADHAAR_SALT);
    return claims;
  }
  try {
    const response = await retryWithBackoff(() =>
      client.request('POST', '/ekyc/confirm', { txnId, otp })
    );
    const profile = response.data;
    const claims = extractClaims(profile, process.env.AADHAAR_SALT);
    // Purge the profile
    Object.keys(profile).forEach(key => profile[key] = null);
    return claims;
  } catch (error) {
    throw new Error('Failed to verify KYC: ' + error.message);
  }
}

module.exports = { initiate, verify };