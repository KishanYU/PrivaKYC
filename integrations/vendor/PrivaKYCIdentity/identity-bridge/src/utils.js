const crypto = require('crypto');

function calculateAge(dob) {
  // Assume dob is in YYYY-MM-DD or YYYY format
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

module.exports = { calculateAge, isAdult, hashAadhaarLast4, extractClaims };