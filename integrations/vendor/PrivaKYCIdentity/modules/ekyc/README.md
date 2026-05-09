# Sandbox.co.in e-KYC Module

This module integrates with the sandbox.co.in Unified KYC API to provide Aadhaar e-KYC and DigiLocker XML fetch functionalities.

## Setup

1. Sign up at [developer.sandbox.co.in](https://developer.sandbox.co.in/) to get your API key.
2. In the root directory of the backend project, create or update the `.env` file with your API key:
   ```env
   SANDBOX_API_KEY=your_sandbox_api_key_here
   ```

## Testing

To run the full test flow (OTP Generation -> Verification -> DigiLocker Fetch), execute:

```bash
node test.js
```
