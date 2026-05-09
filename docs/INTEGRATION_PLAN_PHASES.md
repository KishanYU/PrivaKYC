# PrivaKYC Integration Phases – Runtime Notes

This document summarizes how the new integrations are wired into the existing backend without breaking current flows.

## Core entrypoints

- Backend server: `src/app.js` (Express, port `PORT` or `5000`).
- Frontend API base: `VITE_API_BASE_URL=http://localhost:5000/api`.

## New backend modules

- `src/modules/ekyc/index.js`
  - `sendOTP(aadhaarNumber)` – sandbox → Setu → mock fallback.
  - `verifyOTP(txnId, otp)` – sandbox → Setu → mock fallback.
  - `fetchAadhaarXMLFromDigiLocker(consentArtifact)` – returns `{ provider, xml }` (mock XML in demo mode).
- `src/modules/sponsor/index.js`
  - `verifyVoiceLiveness(userId, expectedNumber, audioBuffer)` – ElevenLabs placeholder, mock pass if not configured.
  - `logFraudAlert(alertType, bankId, nullifierHash, extra?)` – Snowflake placeholder, never throws.
  - `getFraudHeatmap(timeWindow)` – returns mock structure when Snowflake is not configured.
  - `logToAuditTrail(eventData)` – Backbone.io placeholder, best-effort only.

## New routes

- `POST /api/ekyc/live/initiate`
  - Body: `{ aadhaarNumber }`
  - Response: `{ success, provider, txnId }`
  - Never stores Aadhaar; if needed for correlation, a salted hash is computed only inside the module.
- `POST /api/ekyc/live/verify`
  - Body: `{ txnId, otp }`
  - Response:
    - `{ success, provider, kyc: { name, dob, gender, state }, zk: { tokenId, proof, publicSignals }, token: { status } }`
  - Uses existing `generateZkProof` service and stores a minimal `Token` row.
- `GET /api/tokens/:tokenId/status`
  - Response: `{ success, tokenId, status, registerTxId, revokeTxId }`
  - Used by frontend `getRevocationStatus`.
- `GET /api/fraud/heatmap?window=24h`
  - Response: `{ success, data }` where `data` comes from `getFraudHeatmap`.
- `POST /api/voice/verify`
  - Body: `{ userId, expectedNumber, audioBase64 }`
  - Response: `{ success, provider, score, message }`.

## Middleware

- `src/middleware/auditLogger.js`
  - Mounted as `app.use('/api', auditLogger)` after all route handlers.
  - Computes a SHA-256 hash of the request body/query/params and sends a best-effort audit event to `logToAuditTrail`.
  - Never throws; failure only affects logging, not user flows.

## Updated flows

- **Revocation (`POST /api/algorand/revoke-token`)**
  - Fixes the `txId` ordering bug.
  - Updates `Token` status and `revokeTxId`.
  - Triggers:
    - `triggerRevocationWebhook` → n8n (if configured).
    - `logFraudAlert('USER_REVOKED', bankId, token.proofHash)`.
    - `logToAuditTrail` with method, path, txId, and status.
- **DigiLocker callback**
  - `GET /api/digilocker/callback` now calls `fetchAadhaarXMLFromDigiLocker({ code, state })`.
  - Response adds:
    - `aadhaarXml` (mock XML today).
    - `provider` (`mock` unless real DigiLocker is wired).

## Frontend touchpoints

- New OTP-based e-KYC section should call:
  - `POST /api/ekyc/live/initiate` to send OTP.
  - `POST /api/ekyc/live/verify` to verify and obtain `zk.tokenId` + `token.status`.
- High-value voice check:
  - Uses `verifyHighValueVoice` helper in `src/lib/api.js`, which calls `/api/voice/verify` or returns a mock pass when the backend is absent.
- Bank simulator:
  - Interprets backend fields `verified` and `revoked` and maps them into `TokenStatusBadge` states.

## Environment variables

Core:

- `PORT`, `MONGO_URI`, `ALGOD_SERVER`, `ALGOD_TOKEN`, `ALGOD_PORT`, `ALGOD_REGISTRY_ADDRESS`, `INDEXER_SERVER`, `INDEXER_TOKEN`, `INDEXER_PORT`, `N8N_WEBHOOK_URL`.

e-KYC:

- `SETU_CLIENT_ID`, `SETU_CLIENT_SECRET`, `SETU_BASE_URL`, `SANDBOX_API_KEY`, `SANDBOX_BASE_URL`, `AADHAAR_SALT`, `USE_MOCK`.

Sponsors:

- `ELEVENLABS_API_KEY`, `SNOWFLAKE_ACCOUNT`, `SNOWFLAKE_USER`, `SNOWFLAKE_PASSWORD`, `BACKBONE_API_KEY`.

All sponsor and e-KYC integrations are **demo-safe**: if credentials are missing, they return deterministic mock data and never throw.

