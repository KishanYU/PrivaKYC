# Identity Bridge

A Node.js module for integrating with Setu e-KYC Sandbox to perform stateless Aadhaar OTP authentication and return zero-knowledge claims.

## Features

- Singleton SetuClient with OAuth2 JWT caching
- Exponential backoff retry logic for API calls
- Zero-knowledge claims: Age > 18, State, Unique User Hash
- Immediate data purging after claim extraction
- Mock mode for testing

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and fill in your credentials:

- `SETU_CLIENT_ID`
- `SETU_CLIENT_SECRET`
- `SETU_PRODUCT_INSTANCE_ID`
- `SETU_BASE_URL` (https://dg-sandbox.setu.co/api)
- `SETU_OAUTH_URL` (OAuth endpoint)
- `SETU_OAUTH_SCOPE`
- `AADHAAR_SALT` (secret salt for hashing)
- `USE_MOCK` (true/false)

## Usage

```javascript
const { initiate, verify } = require('identity-bridge');

async function example() {
  // Initiate KYC
  const { transactionId } = await initiate('123456789012');

  // Verify with OTP
  const claims = await verify(transactionId, '123456');
  console.log(claims); // { ageOver18: true, state: 'Karnataka', userHash: '...' }
}
```

## API

### initiate(aadhaarNumber)

- **aadhaarNumber**: string (12 digits)
- **Returns**: { transactionId: string }

### verify(txnId, otp)

- **txnId**: string (transaction ID from initiate)
- **otp**: string (6-digit OTP)
- **Returns**: { ageOver18: boolean, state: string, userHash: string }

## Security

- Full Aadhaar profile is purged immediately after extracting claims
- Aadhaar last 4 digits are hashed with a secret salt
- No personal data is stored

## Testing

Run `npm test` to execute the test script.