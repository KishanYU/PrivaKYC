# Identity Bridge Integration Guide

## Architecture Overview

```
┌─────────────────────┐
│   Frontend (React)  │
│  - UI Components    │
│  - Form Handling    │
│  - State Management │
└──────────┬──────────┘
           │
           │ HTTP/REST
           │
┌──────────▼──────────┐
│  Backend (Express)  │
│  - API Routes       │
│  - Auth Middleware  │
│  - Business Logic   │
└──────────┬──────────┘
           │
           │
┌──────────▼──────────┐
│  Identity Bridge    │
│  - KYC Module       │
│  - Setu Integration │
│  - Zero-Knowledge   │
└─────────────────────┘
```

## Data Flow

1. **User Enters Aadhaar** → Frontend sends to Backend
2. **Backend Initiates KYC** → Identity Bridge calls Setu API → Returns txnId
3. **Backend Returns txnId** → Frontend displays OTP entry screen
4. **User Enters OTP** → Frontend sends txnId + OTP to Backend
5. **Backend Verifies** → Identity Bridge processes → Returns claims
6. **Backend Returns Claims** → Frontend stores & proceeds

---

## Backend Integration

### Step 1: Initialize Backend Project

```bash
npm init -y
npm install express axios dotenv cors uuid
npm install --save-dev nodemon
```

### Step 2: Create Environment File (.env)

```
PORT=3000
SETU_CLIENT_ID=your_client_id
SETU_CLIENT_SECRET=your_client_secret
SETU_PRODUCT_INSTANCE_ID=your_instance_id
SETU_BASE_URL=https://dg-sandbox.setu.co/api
SETU_OAUTH_URL=https://auth.setu.co/oauth/token
SETU_OAUTH_SCOPE=ekyc
AADHAAR_SALT=your_secret_salt
USE_MOCK=false
```

### Step 3: Backend Server Setup

```javascript
// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initiate, verify } = require('./identity-bridge/src');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory transaction store (use Redis/DB in production)
const txnStore = new Map();

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============ ROUTES ============

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Initiate KYC
app.post('/api/kyc/initiate', async (req, res) => {
  try {
    const { aadhaarNumber } = req.body;

    if (!aadhaarNumber || aadhaarNumber.length !== 12 || !/^\d+$/.test(aadhaarNumber)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Valid 12-digit Aadhaar number required' 
      });
    }

    const { transactionId } = await initiate(aadhaarNumber);
    
    // Store transaction with metadata
    txnStore.set(transactionId, {
      createdAt: Date.now(),
      aadhaarLast4: aadhaarNumber.slice(-4),
      attempts: 0
    });

    res.json({ 
      success: true, 
      transactionId,
      expiresIn: 600 // 10 minutes in seconds
    });

  } catch (error) {
    console.error('Initiate error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to initiate KYC' 
    });
  }
});

// Verify OTP and get claims
app.post('/api/kyc/verify', async (req, res) => {
  try {
    const { transactionId, otp } = req.body;

    if (!transactionId || !otp) {
      return res.status(400).json({ 
        success: false, 
        error: 'Transaction ID and OTP required' 
      });
    }

    const txnData = txnStore.get(transactionId);
    if (!txnData) {
      return res.status(404).json({ 
        success: false, 
        error: 'Invalid or expired transaction' 
      });
    }

    // Check expiration (10 minutes)
    const AGE_LIMIT = 10 * 60 * 1000;
    if (Date.now() - txnData.createdAt > AGE_LIMIT) {
      txnStore.delete(transactionId);
      return res.status(410).json({ 
        success: false, 
        error: 'Transaction expired. Please start over.' 
      });
    }

    // Check max attempts (3 tries)
    if (txnData.attempts >= 3) {
      txnStore.delete(transactionId);
      return res.status(429).json({ 
        success: false, 
        error: 'Too many failed attempts. Please try again.' 
      });
    }

    const claims = await verify(transactionId, otp);
    
    // Remove transaction after successful verification
    txnStore.delete(transactionId);

    // Create user session/token here if needed
    const sessionId = uuidv4();

    res.json({ 
      success: true, 
      sessionId,
      claims: {
        ageOver18: claims.ageOver18,
        state: claims.state,
        userHash: claims.userHash
      }
    });

  } catch (error) {
    console.error('Verify error:', error);
    
    // Increment attempts
    const txnData = txnStore.get(req.body.transactionId);
    if (txnData) {
      txnData.attempts++;
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to verify OTP' 
    });
  }
});

// Cleanup expired transactions every minute
setInterval(() => {
  const now = Date.now();
  const AGE_LIMIT = 10 * 60 * 1000;
  
  for (const [txnId, data] of txnStore.entries()) {
    if (now - data.createdAt > AGE_LIMIT) {
      txnStore.delete(txnId);
      console.log(`Cleaned up expired transaction: ${txnId}`);
    }
  }
}, 60000);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Identity Bridge backend running on port ${PORT}`);
});
```

---

## Frontend Integration

### Step 1: Create React Component

```javascript
// src/components/KYCForm.jsx
import React, { useState } from 'react';
import axios from 'axios';

const KYCForm = () => {
  const [step, setStep] = useState('aadhaar'); // 'aadhaar' | 'otp' | 'success'
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [claims, setClaims] = useState(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Step 1: Request OTP
  const handleInitiate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/kyc/initiate`, {
        aadhaarNumber: aadhaarNumber.replace(/\s/g, '')
      });

      if (response.data.success) {
        setTransactionId(response.data.transactionId);
        setStep('otp');
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to initiate KYC');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/kyc/verify`, {
        transactionId,
        otp: otp.replace(/\s/g, '')
      });

      if (response.data.success) {
        setClaims(response.data.claims);
        setStep('success');
        // Store session ID if needed
        localStorage.setItem('sessionId', response.data.sessionId);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setStep('aadhaar');
    setAadhaarNumber('');
    setOtp('');
    setTransactionId('');
    setClaims(null);
    setError('');
  };

  return (
    <div className="kyc-container">
      <h1>KYC Verification</h1>

      {/* Step 1: Aadhaar Entry */}
      {step === 'aadhaar' && (
        <form onSubmit={handleInitiate}>
          <div className="form-group">
            <label>Enter Aadhaar Number (12 digits)</label>
            <input
              type="text"
              placeholder="XXXX XXXX XXXX"
              value={aadhaarNumber}
              onChange={(e) => setAadhaarNumber(e.target.value)}
              maxLength="14"
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'Initiating...' : 'Get OTP'}
          </button>
        </form>
      )}

      {/* Step 2: OTP Entry */}
      {step === 'otp' && (
        <form onSubmit={handleVerify}>
          <p className="info">
            OTP sent to registered mobile number
            <br />
            Transaction ID: {transactionId.substring(0, 8)}...
          </p>
          <div className="form-group">
            <label>Enter 6-digit OTP</label>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="button-group">
            <button type="submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" onClick={() => setStep('aadhaar')}>
              Back
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Success */}
      {step === 'success' && claims && (
        <div className="success-message">
          <h2>✓ KYC Verified Successfully!</h2>
          <div className="claims-display">
            <p>
              <strong>Age Verified:</strong>{' '}
              {claims.ageOver18 ? '18+ Years' : 'Below 18'}
            </p>
            <p>
              <strong>State:</strong> {claims.state}
            </p>
            <p>
              <strong>User ID (Hashed):</strong>{' '}
              {claims.userHash.substring(0, 16)}...
            </p>
          </div>
          <button onClick={handleReset}>Verify Another</button>
        </div>
      )}
    </div>
  );
};

export default KYCForm;
```

### Step 2: Add Styling

```css
/* src/styles/KYCForm.css */
.kyc-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 5px rgba(76, 175, 80, 0.3);
}

button {
  width: 100%;
  padding: 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background: #45a049;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.button-group {
  display: flex;
  gap: 10px;
}

.button-group button {
  width: 50%;
}

.error {
  color: #d32f2f;
  margin: 10px 0;
  padding: 10px;
  background: #ffebee;
  border-radius: 4px;
}

.info {
  background: #e3f2fd;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 20px;
  color: #1976d2;
}

.success-message {
  text-align: center;
  background: #f1f8e9;
  padding: 20px;
  border-radius: 8px;
}

.claims-display {
  text-align: left;
  background: white;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  border-left: 4px solid #4CAF50;
}

.claims-display p {
  margin: 10px 0;
}
```

### Step 3: Setup React App (.env)

```
REACT_APP_API_URL=http://localhost:3000
```

### Step 4: Use Component

```javascript
// src/App.jsx
import React from 'react';
import KYCForm from './components/KYCForm';
import './styles/KYCForm.css';

function App() {
  return (
    <div className="App">
      <KYCForm />
    </div>
  );
}

export default App;
```

---

## Communication Protocol

### Request: Initiate KYC
```json
POST /api/kyc/initiate
Content-Type: application/json

{
  "aadhaarNumber": "123456789012"
}
```

### Response: Initiate Success
```json
{
  "success": true,
  "transactionId": "mock-txn-123",
  "expiresIn": 600
}
```

### Request: Verify OTP
```json
POST /api/kyc/verify
Content-Type: application/json

{
  "transactionId": "mock-txn-123",
  "otp": "123456"
}
```

### Response: Verify Success
```json
{
  "success": true,
  "sessionId": "uuid-here",
  "claims": {
    "ageOver18": true,
    "state": "Karnataka",
    "userHash": "hash..."
  }
}
```

---

## Production Checklist

### Backend
- [ ] Use environment variables for all secrets
- [ ] Replace in-memory store with Redis/PostgreSQL
- [ ] Add authentication middleware
- [ ] Implement rate limiting
- [ ] Add request validation schemas
- [ ] Enable HTTPS
- [ ] Add comprehensive logging
- [ ] Implement transaction signing
- [ ] Add database audit trail

### Frontend
- [ ] Add form validation
- [ ] Implement error boundaries
- [ ] Add loading states
- [ ] Use HTTPS for API calls
- [ ] Store sensitive data securely
- [ ] Add accessibility features
- [ ] Implement refresh token logic
- [ ] Add analytics tracking

---

## Testing APIs with cURL

```bash
# Initiate
curl -X POST http://localhost:3000/api/kyc/initiate \
  -H "Content-Type: application/json" \
  -d '{"aadhaarNumber":"123456789012"}'

# Verify
curl -X POST http://localhost:3000/api/kyc/verify \
  -H "Content-Type: application/json" \
  -d '{"transactionId":"mock-txn-123","otp":"123456"}'
```
