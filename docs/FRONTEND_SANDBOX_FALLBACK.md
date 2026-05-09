# Frontend Sandbox & Fallback Integration

This document explains how the PrivaKYC frontend handles live backend integration and local sandbox fallback.

## Purpose

The frontend is designed to work in two modes:

1. **Backend-connected mode** — uses `VITE_API_BASE_URL` to call the running Express backend.
2. **Sandbox/demo mode** — when `VITE_API_BASE_URL` is missing, the app uses browser-local fallback helpers so the demo still works.

## Environment

Create a `.env` file in `PrivaKYC-Frontend` or at the frontend project root with:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_N8N_REVOKE_WEBHOOK=
```

If `VITE_API_BASE_URL` is omitted, the app enters sandbox mode automatically.

## What sandbox mode covers

- `uploadAadhaarXml(formData)` parses the XML in the browser.
- `createProof(payload)` simulates a ZK proof with a demo token ID.
- `registerToken(payload)` stores the token locally and returns a mock Algorand txId.
- `buildRegisterTxn(payload)` and `buildRevokeTxn(payload)` return mock unsigned transaction payloads.
- `getActiveTokens()` returns locally stored sandbox tokens.
- `revokeToken(tokenId)` revokes tokens locally and updates sandbox state.
- `getAccessLogs(tokenId)` returns mock audit logs saved in localStorage.
- `getDigiLockerAuthUrl()` returns a demo-mode result and enables the resume button flow.
- `processDigiLockerCallback(code)` returns demo DigiLocker identity data.
- `emergencyRevokeToken(mnemonic)` works with the local recovery phrase stored in sandbox mode.

## Why this matters

These fallback helpers make the frontend demo-ready even when the backend, Algorand wallet, or external API keys are not available. It provides a stable judge-ready flow with:

- visible token generation
- proof registration
- revoke / emergency revoke flows
- DigiLocker-like import UI
- local token state and audit log display

## Files changed

- `PrivaKYC-Frontend/src/lib/api.js`
- `PrivaKYC-Frontend/src/lib/fallback.js`
- `PrivaKYC-Frontend/README.md`

## How to demo

1. Start the frontend with `npm run dev`.
2. Open the dashboard.
3. Use **Sign in with DigiLocker** and click **Resume DigiLocker session**.
4. Generate a proof and see the generated Token ID.
5. Revoke the token and confirm local revocation.
6. Use the emergency recovery phrase to revoke again.

This flow works without requiring backend connectivity, while the real backend-enabled path remains fully supported.