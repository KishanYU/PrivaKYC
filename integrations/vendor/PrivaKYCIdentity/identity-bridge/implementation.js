const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// Utility functions
function calculateAge(dob) {
  const birthYear = parseInt(dob.split('-')[0]);
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

function isAdult(dob) {
  return calculateAge(dob) >= 18;
}

function hashAadhaarLast4(last4, salt) {
  return crypto.createHash('sha256').update(last4 + salt).digest('hex');
}

function extractClaims(profile, salt) {
  const { dateOfBirth, address, aadhaarNumber } = profile.aadhaar;
  const ageOver18 = isAdult(dateOfBirth);
  const state = address.state;
  const last4 = aadhaarNumber.slice(-4);
  const userHash = hashAadhaarLast4(last4, salt);
  return { ageOver18, state, userHash };
}

// Singleton SetuClient class
class SetuClient {
  static instance = null;

  constructor() {
    if (SetuClient.instance) {
      return SetuClient.instance;
    }
    this.token = null;
    this.tokenExpiry = null;
    this.clientId = process.env.SETU_CLIENT_ID;
    this.clientSecret = process.env.SETU_CLIENT_SECRET;
    this.oauthUrl = process.env.SETU_OAUTH_URL;
    this.scope = process.env.SETU_OAUTH_SCOPE;
    this.baseUrl = process.env.SETU_BASE_URL;
    SetuClient.instance = this;
  }

  async getToken() {
    if (this.token && this.tokenExpiry && Date.now() < this.tokenExpiry - 60000) {
      return this.token;
    }
    try {
      const response = await axios.post(this.oauthUrl, {
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: this.scope
      });
      this.token = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      return this.token;
    } catch (error) {
      throw new Error('Failed to obtain OAuth token: ' + error.message);
    }
  }

  async request(method, url, data = null) {
    const token = await this.getToken();
    const config = {
      method,
      url: this.baseUrl + url,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    if (data) config.data = data;
    return axios(config);
  }
}

// Retry with exponential backoff
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

// KYC functions
const client = new SetuClient();

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

// Export functions
module.exports = { initiate, verify };

// Example usage (uncomment to test)
async function test() {
  try {
    console.log('Initiating KYC...');
    const { transactionId } = await initiate('123456789012');
    console.log('Transaction ID:', transactionId);

    console.log('Verifying...');
    const claims = await verify(transactionId, '123456');
    console.log('Claims:', claims);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();