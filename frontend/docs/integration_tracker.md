# Frontend & Backend Integration Tracker

This document tracks the phases of integrating the `PrivaKYC-Frontend` repository with our zero-knowledge Node.js backend.

## 🎯 Phase Breakdown

> Priority rule: real backend integration first. Sandbox fallback is for demonstration only when the backend is unavailable.

### Phase 1: Real Backend Integration
- [ ] Create `PrivaKYC-Frontend/.env` with `VITE_API_BASE_URL=http://localhost:5000/api`.
- [ ] Confirm the backend is running on port `5000` and the frontend uses the same base URL.
- [ ] Align `src/lib/api.js` with live backend routes and response shapes.
- [ ] Only allow fallback mocks when the backend is truly offline.
**Testing Strategy:** Start the backend and frontend together, upload an Aadhaar XML, and verify the request reaches `http://localhost:5000/api/upload-xml` and returns HTTP `200`.

### Phase 2: DigiLocker + Zero-Knowledge Proof Flow
- [ ] Validate `GET /api/digilocker/auth` returns an auth URL or demo-mode payload.
- [ ] Confirm `DashboardPage.jsx` captures `code` from the redirect and runs `processDigiLockerCallback()`.
- [ ] Confirm the resulting DOB is passed into `/api/zk/generate-proof` and a token ID is returned.
**Testing Strategy:** Use the frontend button, then use the resume callback flow. Verify the UI shows the proof generation step and displays the generated token.

### Phase 3: Algorand Anchoring + Pera Wallet
- [ ] Confirm `registerToken()` can successfully call `/api/algorand/register-token`.
- [ ] Confirm wallet signing flow is connected to `buildRegisterTxn()` and `submit-register-txn`.
- [ ] Update the UI to show a signed TX flow and returned Algorand TX ID.
**Testing Strategy:** Connect a live Pera Wallet, build a register transaction, sign it in the wallet, submit it, and verify the returned `txId` appears.

### Phase 4: Revocation & Compliance Logging
- [ ] Confirm revocation uses `/api/algorand/revoke-token` and optionally n8n webhook dispatch.
- [ ] Ensure `getAccessLogs(tokenId)` loads `/api/compliance/logs/:tokenId` and renders provenance events.
- [ ] Ensure the bank simulator and token list show `REVOKED` state correctly.
**Testing Strategy:** Revoke an active token, then re-run the simulator and verify the UI shows blocked access and updated audit logs.

### Phase 5: Sandbox Demo Fallback (Backup)
- [ ] Verify the browser local mode works when `VITE_API_BASE_URL` is missing.
- [ ] Confirm local `mockUploadAadhaarXml`, `mockCreateProof`, `mockRegisterToken`, and `mockRevokeToken` all work.
- [ ] Confirm emergency revoke works using the locally generated recovery phrase.
**Testing Strategy:** Remove `VITE_API_BASE_URL`, restart the frontend, and replay the full demo flow entirely in browser mode.

## 📌 What I need from you
- `VITE_API_BASE_URL` for the live backend, ideally `http://localhost:5000/api`.
- If available, `VITE_N8N_REVOKE_WEBHOOK=https://jckirthi.app.n8n.cloud/webhook/revoke-token` for live revoke automation.
- Backend `.env` values for real Algorand flow:
  - `ALGOD_SERVER=https://testnet-api.algonode.cloud`
  - `ALGOD_TOKEN=<your-algod-token>`
  - `ALGOD_PORT=443`
  - `ALGOD_REGISTRY_ADDRESS=V2BESTC7IDRSUDOGPL4DTTFM5QGOBH7CLHFPHG4R63S6TRRQXEZ5DDUMJE`
  - `INDEXER_SERVER=https://testnet-idx.algonode.cloud`
  - `INDEXER_PORT=443`
  - `INDEXER_TOKEN=<your-indexer-token>`
- Backend `.env` values for live DigiLocker:
  - `DIGILOCKER_CLIENT_ID`, `DIGILOCKER_CLIENT_SECRET`, `REDIRECT_URI`
- Backend `.env` values for Setu / eKYC:
  - `SETU_CLIENT_ID`, `SETU_CLIENT_SECRET`, `SETU_BASE_URL`
  - `SANDBOX_API_KEY`, `SANDBOX_BASE_URL`
  - `AADHAAR_SALT`, `USE_MOCK`
- `MONGO_URI` for backend persistence.

### How to obtain each secret
- Algorand:
  - Get `ALGOD_SERVER`, `ALGOD_TOKEN`, and optionally `ALGOD_PORT` from a testnet provider such as PureStake or AlgoNode.
  - Get `INDEXER_SERVER` and `INDEXER_TOKEN` from the same provider or AlgoExplorer testnet.
  - Use a controlled Algorand address for `ALGOD_REGISTRY_ADDRESS`.
- DigiLocker:
  - Apply via the DigiLocker Developer Portal.
  - Register a new OAuth application and copy the client ID and secret.
  - Register `REDIRECT_URI` as `http://localhost:5000/api/digilocker/callback` for local testing.
- Setu / eKYC:
  - Sign up for Setu sandbox credentials.
  - Copy `SETU_CLIENT_ID` and `SETU_CLIENT_SECRET`.
  - Set `SETU_BASE_URL` to the sandbox endpoint from Setu.
  - If Setu supplies a sandbox API key, put it in `SANDBOX_API_KEY` and the matching URL in `SANDBOX_BASE_URL`.
  - Generate a private random string for `AADHAAR_SALT`.
  - Set `USE_MOCK=false` for real Setu behavior, or `true` to stay in demo/mock mode.
- n8n webhook:
  - Create a POST webhook in n8n and paste its URL into `VITE_N8N_REVOKE_WEBHOOK` for frontend revoke automation.
  - This webhook receives JSON payloads like `{ wallet, tokenId, revokedAt }` when a token is revoked.
  - This is optional and used to trigger email, Slack, Discord, audit logs, fraud checks, or sponsor workflows.

> Note: sandbox demo mode does not require these live service secrets. It works with local browser mocks so we can still show the full flow.

## 🧪 How to test in browser
1. Run the backend: `npm run dev` or `node src/app.js` in the backend repo.
2. Run the frontend: `npm install` then `npm run dev` inside `PrivaKYC-Frontend`.
3. Open the Vite URL shown by the frontend (usually `http://localhost:4173`).
4. Use the dashboard: upload Aadhaar XML, bind biometrics, generate proof, and register the token.
5. Test revocation: revoke the token and watch the UI update.
6. If backend is unavailable, clear `VITE_API_BASE_URL` and repeat the flow in sandbox mode.
