# Identity Bridge - Complete Integration Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            USER BROWSER (HTTPS)                             │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                      React Frontend Application                       │   │
│  │                                                                       │   │
│  │  ┌─────────────────────┐  ┌────────────────────────────────────┐    │   │
│  │  │  KYC Form Component │  │  State Management (React Hooks)    │    │   │
│  │  │                     │  │  - aadhaarNumber                   │    │   │
│  │  │  - Input fields     │  │  - otp                            │    │   │
│  │  │  - Form validation  │  │  - transactionId                  │    │   │
│  │  │  - Error handling   │  │  - claims                         │    │   │
│  │  │  - Loading states   │  │  - loading/error states           │    │   │
│  │  │                     │  │                                    │    │   │
│  │  └─────────────────────┘  └────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                          │
│                         HTTP/REST API Calls                                   │
│                         (JSON payloads)                                       │
│                                    │                                          │
└────────────────────────────────────┼──────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Express.js Backend Server (Port 3000)                   │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                         Middleware Layer                             │   │
│  │  - CORS handler        - Request logging      - Body parser         │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                         API Routes Layer                             │   │
│  │                                                                       │   │
│  │  POST /api/kyc/initiate                                             │   │
│  │  ├─ Validate Aadhaar (12 digits)                                   │   │
│  │  ├─ Call Identity Bridge initiate()                                │   │
│  │  ├─ Store transaction in Memory/Redis                             │   │
│  │  └─ Return transactionId + expiresIn                              │   │
│  │                                                                       │   │
│  │  POST /api/kyc/verify                                              │   │
│  │  ├─ Validate inputs (txnId + OTP)                                 │   │
│  │  ├─ Check transaction exists & not expired                        │   │
│  │  ├─ Check attempt count < 3                                       │   │
│  │  ├─ Call Identity Bridge verify()                                 │   │
│  │  ├─ Extract zero-knowledge claims                                 │   │
│  │  ├─ Generate session ID                                           │   │
│  │  └─ Return claims + sessionId                                     │   │
│  │                                                                       │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                      Data Store Layer                               │   │
│  │                                                                       │   │
│  │  Transaction Store (In-Memory Map):                                │   │
│  │  {                                                                   │   │
│  │    "mock-txn-123": {                                               │   │
│  │      transactionId: "mock-txn-123",                                │   │
│  │      aadhaarLast4: "1234",                                         │   │
│  │      createdAt: 1715254800000,                                     │   │
│  │      attempts: 2,                                                  │   │
│  │      status: "PENDING"                                             │   │
│  │    }                                                                │   │
│  │  }                                                                   │   │
│  │                                                                       │   │
│  ├──────────────────────────────────────────────────────────────────────┤   │
│  │                    Error Handling & Cleanup                         │   │
│  │  - 404 Not Found handler                                           │   │
│  │  - Global error middleware                                         │   │
│  │  - Automatic cleanup of expired transactions (every 60s)           │   │
│  │  - Graceful shutdown handler                                       │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                          │
└────────────────────────────────────┼──────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       Identity Bridge Module Layer                          │
│                     (src/kyc.js, src/setuClient.js)                        │
│                                                                               │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    SetuClient (Singleton)                           │   │
│  │                                                                       │   │
│  │  Features:                                                          │   │
│  │  - OAuth2 token caching                                            │   │
│  │  - Automatic token refresh (1 min buffer)                          │   │
│  │  - Bearer token injection                                          │   │
│  │                                                                       │   │
│  │  Properties:                                                        │   │
│  │  - token: current JWT token                                        │   │
│  │  - tokenExpiry: expiration timestamp                               │   │
│  │  - clientId, clientSecret: OAuth credentials                       │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    KYC Flow Functions                               │   │
│  │                                                                       │   │
│  │  initiate(aadhaarNumber)                                            │   │
│  │  └─ Retry Logic (Exponential backoff: 1s, 2s, 4s)                 │   │
│  │     └─ POST /ekyc/init {aadhaarNumber}                            │   │
│  │        └─ Returns {transactionId}                                  │   │
│  │                                                                       │   │
│  │  verify(txnId, otp)                                                │   │
│  │  └─ Retry Logic (Exponential backoff: 1s, 2s, 4s)                 │   │
│  │     └─ POST /ekyc/confirm {txnId, otp}                            │   │
│  │        └─ Returns complete Aadhaar profile                        │   │
│  │           ├─ Extract zero-knowledge claims                        │   │
│  │           │  ├─ calculateAge() from dateOfBirth                   │   │
│  │           │  ├─ Extract state from address                        │   │
│  │           │  └─ Hash Aadhaar last 4 digits                        │   │
│  │           └─ Purge (set to null) full profile                     │   │
│  │              └─ Return claims only                                 │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                          │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                    Utility Functions                                │   │
│  │                                                                       │   │
│  │  extractClaims(profile, salt)                                       │   │
│  │  ├─ ageOver18: isAdult(dateOfBirth) ► boolean                      │   │
│  │  ├─ state: profile.aadhaar.address.state ► string                  │   │
│  │  └─ userHash: SHA256(last4 + salt) ► string                        │   │
│  │                                                                       │   │
│  │  hashAadhaarLast4(last4, salt)                                      │   │
│  │  └─ SHA256 hash for privacy-preserving user identification          │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                    │                                          │
└────────────────────────────────────┼──────────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      External Services (Setu API)                           │
│                                                                               │
│  ┌──────────────────────────────┐         ┌──────────────────────────────┐  │
│  │   OAuth2 Token Server        │         │   Setu e-KYC API            │  │
│  │                              │         │                              │  │
│  │  POST /oauth/token           │         │  POST /api/ekyc/init        │  │
│  │  ├─ client_id                │         │  ├─ aadhaarNumber           │  │
│  │  ├─ client_secret            │         │  └─ Returns transactionId   │  │
│  │  └─ scope                    │         │                              │  │
│  │                              │         │  POST /api/ekyc/confirm     │  │
│  │  Returns:                    │         │  ├─ txnId                   │  │
│  │  ├─ access_token (JWT)       │         │  ├─ otp                     │  │
│  │  └─ expires_in (seconds)     │         │  └─ Returns full profile    │  │
│  │                              │         │                              │  │
│  └──────────────────────────────┘         └──────────────────────────────┘  │
│                                                                               │
│                    (Requires valid Setu credentials)                         │
│                    Production URL: https://dg.setu.co                        │
│                    Sandbox URL: https://dg-sandbox.setu.co                   │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow - Complete KYC Journey

### Step 1: User Enters Aadhaar

```
User Input (Browser)
         │
         ▼
  [Input Validation]
  ├─ 12 digits only
  ├─ No special characters
  └─ Numeric only
         │
         ▼
POST /api/kyc/initiate
{
  "aadhaarNumber": "123456789012"
}
```

### Step 2: Backend Initiates KYC

```
Backend Receives Request
         │
         ▼
  [Validate Aadhaar]
  ├─ Length = 12
  ├─ All digits
  └─ Not empty
         │
         ▼
  [Call Identity Bridge]
  initiate("123456789012")
         │
         ▼
  [Exponential Retry Logic]
  └─ Attempt 1: 1 second delay
  └─ Attempt 2: 2 seconds delay
  └─ Attempt 3: 4 seconds delay
         │
         ▼
  [Call Setu OAuth]
  POST /oauth/token
  ├─ Get/Refresh JWT token
  └─ Cache for reuse
         │
         ▼
  [Call Setu eKYC API]
  POST /ekyc/init
  ├─ Send Aadhaar number
  └─ Receive transactionId
         │
         ▼
  [Store Transaction]
  Save in Memory Store:
  {
    transactionId: "mock-txn-123",
    aadhaarLast4: "9012",
    createdAt: 1715254800000,
    attempts: 0,
    status: "PENDING"
  }
         │
         ▼
  [Send Response]
Response 200 OK
{
  "success": true,
  "transactionId": "mock-txn-123",
  "expiresIn": 600
}
```

### Step 3: Frontend Displays OTP Screen

```
Receive Response
         │
         ▼
  [Store transactionId]
  React State update
  setTransactionId("mock-txn-123")
         │
         ▼
  [Update UI]
  setStep("otp")
         │
         ▼
  [Start Timer]
  60-second countdown
  for OTP entry
         │
         ▼
  [Render OTP Input]
  Show OTP input field
  + Back button
```

### Step 4: User Enters OTP

```
User Input (Browser)
         │
         ▼
  [Input Validation]
  ├─ 6 digits only
  ├─ Numeric only
  └─ No spaces
         │
         ▼
POST /api/kyc/verify
{
  "transactionId": "mock-txn-123",
  "otp": "123456"
}
```

### Step 5: Backend Verifies OTP

```
Backend Receives Request
         │
         ▼
  [Validate Inputs]
  ├─ txnId exists
  ├─ OTP is 6 digits
  └─ Both non-empty
         │
         ▼
  [Check Transaction]
  ├─ Find in store
  ├─ Not expired?
  └─ Attempts < 3?
         │
         ▼
  [Call Identity Bridge]
  verify(txnId, otp)
         │
         ▼
  [Exponential Retry]
  └─ Attempt 1,2,3 with backoff
         │
         ▼
  [Call Setu Confirm]
  POST /ekyc/confirm
  ├─ Send txnId + otp
  └─ Receive full profile:
     {
       aadhaar: {
         name: "John Doe",
         dateOfBirth: "1995-05-15",
         gender: "M",
         address: {
           state: "Karnataka",
           ...
         },
         aadhaarNumber: "XXXX1234"
       },
       xml: "..."
     }
         │
         ▼
  [Extract Claims]
  ├─ calculateAge(dateOfBirth)
  │  └─ 2026 - 1995 = 31 years
  │  └─ 31 >= 18? true
  │
  ├─ state = "Karnataka"
  │
  └─ userHash = SHA256("1234" + salt)
     └─ "b9394ca21febbfe9d42834d..."
         │
         ▼
  [Purge Profile]
  Set all profile fields to null
  (Memory cleanup)
         │
         ▼
  [Create Session]
  sessionId = uuidv4()
  "a7f4d8c2-9e1b-4f6a-8d2c-..."
         │
         ▼
  [Delete Transaction]
  Remove from store after success
         │
         ▼
  [Send Response]
Response 200 OK
{
  "success": true,
  "sessionId": "a7f4d8c2-9e1b-4f6a-8d2c-...",
  "claims": {
    "ageOver18": true,
    "state": "Karnataka",
    "userHash": "b9394ca21febbfe9d42834d..."
  }
}
```

### Step 6: Frontend Displays Success

```
Receive Response
         │
         ▼
  [Store Session]
  localStorage.setItem("sessionId", sessionId)
         │
         ▼
  [Update State]
  setClaims(claims)
  setStep("success")
         │
         ▼
  [Render Success Screen]
  ├─ Display ageOver18 ✓
  ├─ Display state
  ├─ Display hashed userHash
  └─ Show security message
         │
         ▼
  User Successfully Verified
```

---

## Security Considerations

### Data Security

```
Raw Aadhaar Profile
         │
         ├─ Loaded into memory
         ├─ Claims extracted
         │  ├─ Age calculated
         │  ├─ State extracted
         │  └─ Last 4 digits hashed
         │
         ├─ Full profile nullified
         │  (All fields set to null)
         │
         ├─ No persistence
         └─ No logging of sensitive data
         
Only Claims Returned:
- ageOver18 (boolean)
- state (string)
- userHash (SHA256)
```

### Token Security

```
Setu JWT Token (Private)
         │
         ├─ Cached in backend memory
         ├─ Expires automatically
         ├─ Refreshed when near expiry
         │
         └─ NOT sent to frontend
            (Prevents token theft)
```

### Session Management

```
Session ID (Public)
         │
         ├─ Sent to frontend
         ├─ Stored in localStorage
         │
         └─ Use for subsequent requests:
            POST /api/user/profile
            Header: Authorization: Bearer <sessionId>
```

---

## Error Handling Flow

```
User Action
     │
     ▼
Backend Validation
     │
     ├─ Valid? ──────────────────► Process
     │
     └─ Invalid?
        │
        ├─ 400 Bad Request
        │  └─ "Invalid Aadhaar format"
        │
        ├─ 404 Not Found
        │  └─ "Transaction expired"
        │
        ├─ 410 Gone
        │  └─ "Transaction expired"
        │
        └─ 429 Too Many Requests
           └─ "Too many attempts"

Frontend Error Handling
     │
     ├─ Display error message
     ├─ Enable retry
     ├─ Reset form state
     └─ Log for analytics
```

---

## Performance Optimization

### Caching Strategy

```
JWT Token Cache
├─ Lifetime: until expiry - 60 seconds
├─ Saves OAuth call time (typically 200-500ms)
└─ One token shared across all requests

Transaction Store
├─ In-memory HashMap (O(1) lookup)
├─ Auto-cleanup every 60 seconds
└─ Replace with Redis for scale
```

### Network Optimization

```
Request Flow
├─ Payload size: ~50 bytes (initiate)
├─ Response size: ~150 bytes (verify)
├─ Latency: ~500ms-2s (Setu API call)
│  └─ 3 retries with exponential backoff
│  └─ Total worst case: ~7 seconds
│
└─ Frontend UX
   ├─ Loading spinner
   ├─ Disabled buttons during requests
   └─ Timeout feedback
```

---

## Deployment Considerations

### Database Migration (from in-memory)

For production, replace:
```javascript
const transactionStore = new Map();
```

With:
```javascript
// PostgreSQL example
const db = require('pg-promise')();
const connection = db('postgresql://...');

// Store: INSERT INTO transactions (txnId, data, createdAt)
// Retrieve: SELECT * FROM transactions WHERE txnId = $1
// Cleanup: DELETE FROM transactions WHERE createdAt < now() - interval '10 minutes'
```

### Redis Cache (for token & session)

```javascript
const redis = require('redis');
const client = redis.createClient();

// Store JWT: SET setu:token <token> EX 3600
// Retrieve JWT: GET setu:token
// Store Session: SET session:<sessionId> <userData> EX 86400
```

### Monitoring & Logging

```javascript
// Add request ID tracking
const requestId = req.get('x-request-id') || uuidv4();

// Log structured data
console.log({
  requestId,
  timestamp: new Date().toISOString(),
  action: 'kyc_initiate',
  aadhaarLast4,
  duration: Date.now() - startTime,
  status: 'success|error'
});
```

This enables tracking, debugging, and compliance auditing.