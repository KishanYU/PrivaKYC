/**
 * ===============================================
 * BACKEND CODE - IDENTITY BRIDGE KYC SERVER
 * ===============================================
 * Complete production-ready backend for Setu e-KYC integration
 * Runs on: http://localhost:3000
 */

const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Import Identity Bridge module
const { initiate, verify } = require('./identity-bridge/src');

// ===============================================
// 1. INITIALIZE EXPRESS APP
// ===============================================

const app = express();

// ===============================================
// 2. MIDDLEWARE CONFIGURATION
// ===============================================

// CORS Setup
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`\n[${timestamp}] ${req.method} ${req.path}`);
  if (req.method === 'POST' && req.body) {
    console.log('Request Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// ===============================================
// 3. TRANSACTION STORAGE (Replace with DB in production)
// ===============================================

const transactionStore = new Map();

class TransactionManager {
  /**
   * Create a new transaction
   */
  static create(txnId, aadhaarLast4) {
    const record = {
      transactionId: txnId,
      aadhaarLast4,
      createdAt: Date.now(),
      attempts: 0,
      lastAttempt: null,
      status: 'PENDING'
    };
    
    transactionStore.set(txnId, record);
    console.log(`✓ Transaction created: ${txnId}`);
    return record;
  }

  /**
   * Get a transaction
   */
  static get(txnId) {
    return transactionStore.get(txnId);
  }

  /**
   * Record failed attempt
   */
  static recordAttempt(txnId) {
    const record = transactionStore.get(txnId);
    if (record) {
      record.attempts++;
      record.lastAttempt = Date.now();
      console.log(`! Attempt ${record.attempts} for transaction: ${txnId}`);
    }
  }

  /**
   * Mark transaction as verified
   */
  static markVerified(txnId) {
    const record = transactionStore.get(txnId);
    if (record) {
      record.status = 'VERIFIED';
      console.log(`✓ Transaction verified: ${txnId}`);
    }
  }

  /**
   * Delete transaction (cleanup)
   */
  static delete(txnId) {
    transactionStore.delete(txnId);
    console.log(`✗ Transaction deleted: ${txnId}`);
  }

  /**
   * Check if transaction expired
   */
  static isExpired(txnId, ageLimit = 10 * 60 * 1000) {
    const record = transactionStore.get(txnId);
    if (!record) return true;
    const expired = Date.now() - record.createdAt > ageLimit;
    if (expired) {
      console.log(`⏱ Transaction expired: ${txnId}`);
    }
    return expired;
  }

  /**
   * Cleanup all expired transactions
   */
  static cleanupExpired(ageLimit = 10 * 60 * 1000) {
    const now = Date.now();
    let cleaned = 0;

    for (const [txnId, record] of transactionStore.entries()) {
      if (now - record.createdAt > ageLimit) {
        transactionStore.delete(txnId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned up ${cleaned} expired transactions`);
    }
    return cleaned;
  }

  /**
   * Get statistics
   */
  static getStats() {
    return {
      totalTransactions: transactionStore.size,
      transactions: Array.from(transactionStore.values()).map(t => ({
        id: t.transactionId.substring(0, 8) + '...',
        status: t.status,
        attempts: t.attempts,
        ageSeconds: Math.round((Date.now() - t.createdAt) / 1000)
      }))
    };
  }
}

// ===============================================
// 4. VALIDATION UTILITIES
// ===============================================

const Validators = {
  /**
   * Validate Aadhaar number (12 digits)
   */
  isValidAadhaar(value) {
    if (!value) return false;
    const cleaned = String(value).replace(/\D/g, '');
    return cleaned.length === 12;
  },

  /**
   * Validate OTP (6 digits)
   */
  isValidOtp(value) {
    if (!value) return false;
    const cleaned = String(value).replace(/\D/g, '');
    return cleaned.length === 6;
  },

  /**
   * Validate transaction ID
   */
  isValidTransactionId(value) {
    return value && typeof value === 'string' && value.length > 0;
  }
};

// ===============================================
// 5. API ROUTES
// ===============================================

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * GET /api/stats
 * Get transaction statistics (debug endpoint)
 */
app.get('/api/stats', (req, res) => {
  res.json(TransactionManager.getStats());
});

/**
 * POST /api/kyc/initiate
 * Initiate KYC process with Aadhaar number
 * 
 * Request:
 * {
 *   "aadhaarNumber": "123456789012"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "transactionId": "mock-txn-123",
 *   "expiresIn": 600
 * }
 */
app.post('/api/kyc/initiate', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { aadhaarNumber } = req.body;

    // VALIDATION
    if (!Validators.isValidAadhaar(aadhaarNumber)) {
      console.log('❌ Invalid Aadhaar format');
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid 12-digit Aadhaar number'
      });
    }

    const aadhaarLast4 = String(aadhaarNumber).slice(-4);
    console.log(`📱 Initiating KYC for Aadhaar ending in: ${aadhaarLast4}`);

    // CALL IDENTITY BRIDGE
    const { transactionId } = await initiate(aadhaarNumber);
    console.log(`✓ Received transactionId: ${transactionId}`);

    // STORE TRANSACTION
    TransactionManager.create(transactionId, aadhaarLast4);

    const duration = Date.now() - startTime;
    console.log(`⏱ Initiate completed in ${duration}ms`);

    res.json({
      success: true,
      transactionId,
      expiresIn: 600, // 10 minutes in seconds
      message: 'OTP initiated successfully'
    });

  } catch (error) {
    console.error('❌ Initiate KYC error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to initiate KYC. Please try again later.'
    });
  }
});

/**
 * POST /api/kyc/verify
 * Verify OTP and return zero-knowledge claims
 * 
 * Request:
 * {
 *   "transactionId": "mock-txn-123",
 *   "otp": "123456"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "sessionId": "uuid-here",
 *   "claims": {
 *     "ageOver18": true,
 *     "state": "Karnataka",
 *     "userHash": "hash..."
 *   }
 * }
 */
app.post('/api/kyc/verify', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { transactionId, otp } = req.body;

    // VALIDATION
    if (!Validators.isValidTransactionId(transactionId)) {
      console.log('❌ Invalid transaction ID');
      return res.status(400).json({
        success: false,
        error: 'Transaction ID is required'
      });
    }

    if (!Validators.isValidOtp(otp)) {
      console.log('❌ Invalid OTP format');
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid 6-digit OTP'
      });
    }

    console.log(`🔑 Verifying OTP for transaction: ${transactionId.substring(0, 8)}...`);

    // CHECK TRANSACTION EXISTS
    const txnRecord = TransactionManager.get(transactionId);
    if (!txnRecord) {
      console.log('❌ Transaction not found');
      return res.status(404).json({
        success: false,
        error: 'Invalid transaction ID'
      });
    }

    // CHECK EXPIRATION (10 minutes)
    if (TransactionManager.isExpired(transactionId)) {
      TransactionManager.delete(transactionId);
      return res.status(410).json({
        success: false,
        error: 'Transaction expired. Please start the process again.'
      });
    }

    // CHECK MAX ATTEMPTS (3 retries)
    if (txnRecord.attempts >= 3) {
      console.log('❌ Too many failed attempts');
      TransactionManager.delete(transactionId);
      return res.status(429).json({
        success: false,
        error: 'Too many failed attempts. Please try again later.'
      });
    }

    // CALL IDENTITY BRIDGE TO VERIFY
    console.log(`✓ Calling verify with OTP...`);
    const claims = await verify(transactionId, otp);
    console.log(`✓ Received claims:`, claims);

    // MARK AS VERIFIED
    TransactionManager.markVerified(transactionId);

    // CREATE SESSION ID
    const sessionId = uuidv4();
    console.log(`✓ Created session: ${sessionId}`);

    // DELETE TRANSACTION AFTER SUCCESS
    TransactionManager.delete(transactionId);

    const duration = Date.now() - startTime;
    console.log(`⏱ Verify completed in ${duration}ms`);

    res.json({
      success: true,
      sessionId,
      claims: {
        ageOver18: claims.ageOver18,
        state: claims.state,
        userHash: claims.userHash
      },
      message: 'KYC verified successfully'
    });

  } catch (error) {
    console.error('❌ Verify KYC error:', error.message);

    // RECORD FAILED ATTEMPT
    TransactionManager.recordAttempt(req.body.transactionId);

    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP. Please try again.'
    });
  }
});

// ===============================================
// 6. CLEANUP JOB
// ===============================================

// Run cleanup every 60 seconds
const cleanupInterval = setInterval(() => {
  TransactionManager.cleanupExpired();
}, 60000);

console.log('🧹 Cleanup job scheduled (every 60 seconds)');

// ===============================================
// 7. ERROR HANDLERS
// ===============================================

/**
 * 404 Not Found Handler
 */
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ===============================================
// 8. SERVER START
// ===============================================

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║     🔐 Identity Bridge Backend Server Started          ║
╠════════════════════════════════════════════════════════╣
║                                                         │
║  🌐 Server URL:   http://localhost:${PORT}
║  🔧 Environment:  ${process.env.NODE_ENV || 'development'}
║  🎭 Mock Mode:    ${process.env.USE_MOCK === 'true' ? 'ENABLED ✓' : 'DISABLED'}
║                                                         │
║  📍 API Endpoints:                                      │
║     • GET  /health                                     │
║     • GET  /api/stats                                  │
║     • POST /api/kyc/initiate                           │
║     • POST /api/kyc/verify                             │
║                                                         │
╚════════════════════════════════════════════════════════╝
  `);
});

// ===============================================
// 9. GRACEFUL SHUTDOWN
// ===============================================

process.on('SIGINT', () => {
  console.log('\n\n🛑 Shutting down gracefully...');
  clearInterval(cleanupInterval);
  server.close(() => {
    console.log('✓ Server closed');
    process.exit(0);
  });
});

// ===============================================
// EXPORT (for testing)
// ===============================================

module.exports = app;
