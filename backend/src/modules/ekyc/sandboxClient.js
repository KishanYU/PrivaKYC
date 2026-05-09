const axios = require('axios');

// Uses sandbox.co.in domain. If you have a different base URL, set SANDBOX_BASE_URL.
const baseURL = process.env.SANDBOX_BASE_URL || 'https://api.sandbox.co.in';

const sandboxClient = axios.create({
  baseURL,
  headers: {
    accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let accessToken = null;

async function getAccessToken() {
  if (accessToken) return accessToken;
  
  console.log('[Sandbox] Authenticating with credentials...');
  // Use a clean axios instance to avoid infinite interceptor recursion
  const authResponse = await axios.post(`${baseURL}/authenticate`, {}, {
    headers: {
      'x-api-key': process.env.SANDBOX_API_KEY,
      'x-api-secret': process.env.SANDBOX_API_SECRET,
      'x-sandbox-version': '1.0.0'
    }
  });
  
  accessToken = authResponse.data.access_token || authResponse.data.token;
  return accessToken;
}

sandboxClient.interceptors.request.use(async (config) => {
  try {
    const token = await getAccessToken();
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['x-api-key'] = process.env.SANDBOX_API_KEY;
    return config;
  } catch (error) {
    console.error('[Sandbox] Auth failed:', error.response?.data || error.message);
    throw error;
  }
});

module.exports = sandboxClient;

