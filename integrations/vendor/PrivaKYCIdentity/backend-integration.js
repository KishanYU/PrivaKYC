const express = require('express');
const { initiate, verify } = require('./identity-bridge/src'); // Adjust path as needed

const app = express();
app.use(express.json());

// In-memory store for transaction IDs (use Redis or database in production)
const txnStore = new Map();

// Endpoint to initiate KYC
app.post('/api/kyc/initiate', async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;

    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      return res.status(400).json({ error: 'Valid Aadhaar number required' });
    }

    const { transactionId } = await initiate(aadhaarNumber);

    // Store txnId temporarily (expires in 10 minutes)
    txnStore.set(transactionId, { createdAt: Date.now() });

    res.json({ transactionId });
  } catch (error) {
    console.error('Initiate error:', error);
    res.status(500).json({ error: 'Failed to initiate KYC' });
  }
});

// Endpoint to verify OTP and get claims
app.post('/api/kyc/verify', async (req, res) => {
  try {
    const { transactionId, otp } = req.body;

    if (!transactionId || !otp) {
      return res.status(400).json({ error: 'Transaction ID and OTP required' });
    }

    // Check if txnId exists and not expired
    const txnData = txnStore.get(transactionId);
    if (!txnData) {
      return res.status(404).json({ error: 'Invalid transaction ID' });
    }

    const ageLimit = 10 * 60 * 1000; // 10 minutes
    if (Date.now() - txnData.createdAt > ageLimit) {
      txnStore.delete(transactionId);
      return res.status(410).json({ error: 'Transaction expired' });
    }

    const claims = await verify(transactionId, otp);

    // Remove txnId after successful verification
    txnStore.delete(transactionId);

    res.json(claims);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Failed to verify KYC' });
  }
});

// Cleanup expired transactions periodically
setInterval(() => {
  const now = Date.now();
  const ageLimit = 10 * 60 * 1000;
  for (const [txnId, data] of txnStore.entries()) {
    if (now - data.createdAt > ageLimit) {
      txnStore.delete(txnId);
    }
  }
}, 60000); // Clean every minute

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Identity Bridge backend running on port ${PORT}`);
});