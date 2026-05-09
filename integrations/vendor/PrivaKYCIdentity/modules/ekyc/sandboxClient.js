const axios = require('axios');

const sandboxClient = axios.create({
  baseURL: 'https://api.sandbox.co.in',
  headers: {
    'x-api-key': process.env.SANDBOX_API_KEY,
    'accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

module.exports = sandboxClient;
