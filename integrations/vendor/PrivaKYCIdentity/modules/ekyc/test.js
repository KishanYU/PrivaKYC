require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const readline = require('readline');
const { sendOTP, verifyOTP, fetchAadhaarXMLFromDigiLocker } = require('./index');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query) => new Promise(resolve => rl.question(query, resolve));

async function runTest() {
  console.log('--- sandbox.co.in e-KYC Test ---');
  
  if (!process.env.SANDBOX_API_KEY) {
    console.warn('\n⚠️  WARNING: SANDBOX_API_KEY is not set. API calls will fail unless the environment variable is exported or set in the root .env file.\n');
  }

  const aadhaarNumber = await askQuestion('Enter Aadhaar Number: ');
  
  console.log('\nGenerating OTP...');
  const generateRes = await sendOTP(aadhaarNumber);
  
  if (!generateRes.success) {
    console.error('Failed to generate OTP:', generateRes.error);
    rl.close();
    return;
  }
  
  console.log(`✓ OTP Generated. Transaction ID: ${generateRes.txnId}`);
  
  const otp = await askQuestion('\nEnter OTP (test mode: 123456): ');
  
  console.log('\nVerifying OTP...');
  const verifyRes = await verifyOTP(generateRes.txnId, otp);
  
  if (!verifyRes.success) {
    console.error('Failed to verify OTP:', verifyRes.error);
    rl.close();
    return;
  }
  
  console.log('\n✓ OTP Verified Successfully!');
  console.log('User Data:', verifyRes.userData);
  console.log('Zero-Knowledge Claims:', verifyRes.zkClaims);
  
  console.log('\nFetching Aadhaar XML from DigiLocker...');
  const xmlRes = await fetchAadhaarXMLFromDigiLocker('dummy_consent_123');
  
  if (xmlRes.success) {
    console.log('\n✓ XML Fetched (first 100 chars):');
    console.log(xmlRes.xmlString.substring(0, 100) + '...');
  }
  
  rl.close();
}

runTest();
