require('dotenv').config();

const { initiate, verify } = require('./kyc');

module.exports = { initiate, verify };