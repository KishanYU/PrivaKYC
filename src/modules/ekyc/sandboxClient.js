const axios = require('axios');

// Uses sandbox.co.in domain. If you have a different base URL, set SANDBOX_BASE_URL.
const baseURL = process.env.SANDBOX_BASE_URL || 'https://api.sandbox.co.in';

const sandboxClient = axios.create({
  baseURL,
  headers: {
    'x-api-key': process.env.SANDBOX_API_KEY,
    accept: 'application/json',
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

module.exports = sandboxClient;

