const { initiate, verify } = require('./src');

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