# PrivaKYC Frontend

PrivaKYC is the frontend for a privacy-preserving, zero-knowledge KYC platform built for NMIT Hacks Cyber Security + Blockchain track.

This application is a clean React + Vite + Tailwind UI inspired by modern Indian fintech design systems like Razorpay, with a polished light theme, accessible layout, and strong onboarding flow.

---

## Key Features

- React + Vite JavaScript application
- Tailwind CSS utility styling with a Razorpay-like light fintech palette
- Responsive, mobile-friendly pages and layouts
- WebAuthn integration for device/biometric binding
- Para wallet integration for wallet-based proof anchoring and transaction signing
- Proof sharing with QR code and copy-to-clipboard experience
- Bank simulator for proof verification and result display
- Revocable token management with secure Algorand-style revocation flow
- Emergency recovery / lost-phone revocation experience with local recovery validation
- Local sandbox revocation registry for offline verification fallback
- Compliance comparison page showing Traditional KYC vs PrivaKYC
- Architecture page for system flow and workflow status
- Axios API helpers for backend integration
- Robust fallback utilities and clean error-ready UX

---

## Pages

- `/` — Landing / Home page with a Razorpay-style hero graphic, solution differentiator section, customer-friendly workflow, and blue contact footer
- `/dashboard` — User dashboard with Aadhaar XML upload, biometrics binding, Para wallet connection, selective disclosure, proof generation, and active token list
- `/share` — Share Proof page with QR code and proof details
- `/bank-simulator` — Bank simulator for proof validation and verification result
- `/compliance` — Compliance dashboard with side-by-side comparison table
- `/architecture` — Architecture overview page for system diagrams and workflow status

---

## Installation

```bash
npm install
```

Create a `.env` file at the project root with the frontend backend URL and optional n8n webhook:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_N8N_REVOKE_WEBHOOK=https://jckirthi.app.n8n.cloud/webhook/revoke-token
```

Create a backend `.env` at the backend repo root with your runtime values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/privakyc
USE_MOCK=false
AADHAAR_SALT=my_super_secret_hackathon_salt_9988
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_TOKEN=<your-algod-token>
ALGOD_PORT=443
INDEXER_SERVER=https://testnet-idx.algonode.cloud
INDEXER_TOKEN=<your-indexer-token>
INDEXER_PORT=443
ALGOD_REGISTRY_ADDRESS=V2BESTC7IDRSUDOGPL4DTTFM5QGOBH7CLHFPHG4R63S6TRRQXEZ5DDUMJE
```

#### Demo asset included
- `sbox_live_key.csv` is included in the repository root as a sample sandbox provider key file for demo/testing.

### Judge-ready demo flow
1. Start the backend and frontend together.
2. Use `VITE_API_BASE_URL=http://localhost:5000/api` and `VITE_N8N_REVOKE_WEBHOOK=https://jckirthi.app.n8n.cloud/webhook/revoke-token`.
3. Upload Aadhaar XML or use DigiLocker demo mode to generate a proof.
4. Copy the 15-word emergency recovery phrase shown after token registration.
5. Paste that phrase into the emergency revoke box and click `Revoke from Web (Emergency)`.
6. The UI then shows a live revoke event, and the n8n webhook triggers with `{ wallet, tokenId, revokedAt }`.

### Environment values for real integration
- `VITE_API_BASE_URL` — required for the live frontend/backend flow.
- `VITE_N8N_REVOKE_WEBHOOK` — optional, used by the frontend to trigger n8n when a token is revoked.

For the backend to work end-to-end, the backend also requires service secrets and provider credentials:
- `ALGOD_SERVER` — Algorand node RPC endpoint (e.g. PureStake testnet URL).
- `ALGOD_TOKEN` — Algorand node API token for the RPC endpoint.
- `ALGOD_PORT` — Algorand node port, usually `443` for HTTPS providers.
- `ALGOD_REGISTRY_ADDRESS` — address that receives zero-ALGO registry transactions; can be a controlled project address.
- `INDEXER_SERVER` — Algorand indexer endpoint to verify transactions.
- `INDEXER_PORT` — indexer port, usually `443` for HTTPS.
- `INDEXER_TOKEN` — optional indexer API token.
- `DIGILOCKER_CLIENT_ID` — DigiLocker OAuth client ID from the DigiLocker Developer Portal.
- `DIGILOCKER_CLIENT_SECRET` — DigiLocker OAuth client secret.
- `REDIRECT_URI` — registered OAuth callback URI, typically `http://localhost:5000/api/digilocker/callback` for local dev.
- `SETU_CLIENT_ID` — Setu eKYC API client ID.
- `SETU_CLIENT_SECRET` — Setu eKYC API client secret.
- `SETU_BASE_URL` — Setu API base URL for sandbox or production.
- `SANDBOX_API_KEY` — additional Setu sandbox key used by the eKYC adapter.
- `SANDBOX_BASE_URL` — optional alternate sandbox host for the eKYC sandbox client.
- `AADHAAR_SALT` — secret salt used when hashing Aadhaar-derived claims.
- `USE_MOCK` — `true`/`false` flag to switch Setu/mock mode.
- `MONGO_URI` — MongoDB connection URI for backend storage.
- `PORT` — backend server port, usually `5000`.

#### How to get each secret
- Algorand (`ALGOD_SERVER`, `ALGOD_TOKEN`, `INDEXER_SERVER`, `INDEXER_TOKEN`):
  1. Register for a PureStake or AlgoNode testnet account.
  2. Create a new API key for the Algorand testnet.
  3. Copy the REST endpoint URL and token into `ALGOD_SERVER`/`ALGOD_TOKEN`.
  4. Use the provider’s indexer endpoint for `INDEXER_SERVER` and token for `INDEXER_TOKEN`.
- DigiLocker (`DIGILOCKER_CLIENT_ID`, `DIGILOCKER_CLIENT_SECRET`, `REDIRECT_URI`):
  1. Apply for DigiLocker Developer access via the official DigiLocker API portal.
  2. Register a new OAuth client and note the client ID and secret.
  3. Set the callback URL to `http://localhost:5000/api/digilocker/callback` for local development.
- Setu (`SETU_CLIENT_ID`, `SETU_CLIENT_SECRET`, `SETU_BASE_URL`, `SANDBOX_API_KEY`, `SANDBOX_BASE_URL`, `AADHAAR_SALT`):
  1. Create a Setu sandbox account and generate client credentials.
  2. Use the sandbox base URL and sandbox API key supplied by Setu.
  3. Generate a random secret string for `AADHAAR_SALT` and keep it private.
  4. Set `USE_MOCK=false` for real Setu integration, or `true` to keep demo mock mode.
- n8n webhook (`VITE_N8N_REVOKE_WEBHOOK`):
  1. Deploy an n8n instance or use a hosted service.
  2. Add a new webhook node with a POST trigger.
  3. Copy the generated webhook URL into `VITE_N8N_REVOKE_WEBHOOK` in the frontend `.env` file.
  4. The frontend sends JSON payloads like:
     ```js
     await fetch(import.meta.env.VITE_N8N_REVOKE_WEBHOOK, {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         wallet: userWallet,
         tokenId,
         revokedAt: new Date().toISOString(),
       }),
     });
     ```
  5. Use this webhook to connect n8n actions such as Email, Slack, Discord, audit logging, fraud checks, or sponsor workflows.

> Important: sandbox/demo mode does not require any of these backend service secrets. It works with browser fallback behavior only.

If `VITE_API_BASE_URL` is not configured, the app automatically falls back to local sandbox/demo mode. In sandbox mode:

- Aadhaar XML parsing runs in the browser.
- Proof generation is simulated for demo flows.
- DigiLocker uses a local mock callback path.
- Token registration and revocation are persisted in browser localStorage.
- Emergency revoke works locally using the 15-word recovery phrase.

---

## Development

```bash
npm run dev
```

Open the local Vite URL shown in the terminal to preview the app.

### Browser test checklist
- Start the backend and frontend together.
- Open the frontend URL, usually `http://localhost:4173`.
- Upload Aadhaar XML and confirm the backend receives the request.
- Complete DigiLocker callback or demo callback flow.
- Generate proof and check the frontend displays an active token.
- Register the token and verify the returned TX ID appears.
- Revoke the token and confirm the UI updates to `REVOKED`.
- If using sandbox mode, remove `VITE_API_BASE_URL` and repeat the full flow.

---

## Build

```bash
npm run build
```

A production build is created in the `dist/` folder.

---

## Preview

```bash
npm run preview
```

---

## Project Structure

```text
PrivaKYC Frontend/
├── .env
├── .gitignore
├── index.html
├── package.json
├── postcss.config.cjs
├── tailwind.config.cjs
├── vite.config.js
├── public/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── routes/
│   │   └── AppRoutes.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── ShareProofPage.jsx
│   │   ├── BankSimulatorPage.jsx
│   │   ├── CompliancePage.jsx
│   │   └── ArchitecturePage.jsx
│   ├── lib/
│   │   ├── api.js
│   │   └── fallback.js
│   ├── hooks/
│   │   ├── useWebAuthn.js
│   │   └── useParaWallet.js
│   ├── styles/
│   │   └── globals.css
│   └── vite-env.d.ts
└── README.md
```

---

## Technology Stack

- React 18
- Vite 5
- Tailwind CSS 3
- Axios for HTTP requests
- React Router DOM for client-side routing
- Framer Motion for subtle page animations
- React QR Code for proof sharing
- Sonner for toast notifications

---

## Backend Integration

The frontend is prepared to call backend endpoints via `src/lib/api.js`.

Current API helper methods:

- `uploadAadhaarXml(formData)` — upload file data for Aadhaar XML parsing
- `createProof(payload)` — request zero-knowledge proof generation
- `verifyProof(proof)` — send proof for verification
- `getActiveTokens()` — fetch active token list
- `revokeToken(tokenId, reason)` — revoke a token, update the revocation registry, and optionally trigger an n8n revoke automation webhook
- `getRevocationStatus(tokenId)` — query token revocation state
- `getDigiLockerAuthUrl()` — request a secure DigiLocker login URL from the backend
- `processDigiLockerCallback(code)` — complete the DigiLocker callback flow and retrieve extracted identity data
- `generateZkProof(payload)` — generate a temporary ZK proof using DigiLocker data

When `VITE_API_BASE_URL` is not configured, the app falls back to a local sandbox mode that uses a browser `localStorage` revocation registry to keep proof verification and revocation flows working without a backend.

Optional n8n automation can be enabled by setting `VITE_N8N_REVOKE_WEBHOOK` to a valid n8n webhook URL. When configured, every `revokeToken()` call sends a revoke payload to n8n for downstream automation.

The `.env` file controls the backend base URL using `VITE_API_BASE_URL`.

## DigiLocker OAuth2 Integration

The dashboard now supports a DigiLocker import flow for verified Aadhaar/DL data. This flow is designed to keep raw data ephemeral, only using it to generate a zero-knowledge proof before clearing it from memory.

### Frontend flow

1. User clicks **Sign in with DigiLocker**.
2. The frontend requests a secure auth URL from `GET /digilocker/auth`.
3. The browser redirects to DigiLocker for government authentication.
4. After login, the backend handles the callback at `/digilocker/callback` and returns `accessToken` plus `extractedData`.
5. The frontend sends the extracted DOB to `POST /zk/generate-proof` to build a ZK proof without storing raw data.

### Demo flow

For hackathon/demo mode, the app also provides a **Demo callback** action that calls the callback endpoint with a mock code and immediately advances the flow through proof generation.

### Key design points

- Raw DigiLocker fields are kept ephemeral and cleared once proof generation completes.
- The UI reflects the import animation steps: `Importing from DigiLocker → Generating Zero-Knowledge Math Proof → Erasing Raw Data`.
- The resulting proof token is displayed so the next Algorand anchoring step can be performed.

---

## Para Wallet Integration

The dashboard also supports Para wallet connection for wallet-based proof anchoring and transaction signing. When Para wallet is installed in the browser, users can connect from the dashboard and use the connected address to secure the proof flow.

### Frontend flow

1. User clicks **Connect Para wallet**.
2. The frontend detects the Para wallet provider injected into `window`.
3. The wallet prompts the user to approve connection.
4. Once connected, the dashboard displays the connected wallet address.

### Notes

- Para wallet support is implemented via `src/hooks/useParaWallet.js`.
- The integration currently relies on the injected extension provider and does not add new npm dependencies.
- The wallet disconnect button resets the connected address state.

---

## UI / UX Notes

- Light-themed Razorpay-inspired design
- Landing page with a custom hero background image, clear solution differentiation, and a customer-first workflow section
- Clean card-based layout, smooth spacing, and consistent typography
- Accessible form controls, buttons, and alerts
- Mobile-first responsive layout
- Friendly status messaging for binding, proof generation, and emergency revocation
- Secure token revocation flow with biometric verification and Algorand transaction confirmation
- Local sandbox revocation registry for offline or demo mode when backend connectivity is unavailable
- Blue Razorpay-style footer with visible white contact info for clear visibility
- Designed for judges: simple, secure, and polished

---

## Notes for team

- The current app contains placeholder interactions for file upload and proof verification.
- Backend integration should replace mock states with real API responses.
- Keep the UI simple and professional, avoiding unnecessary AI/novelty styling.
- Use the `src/hooks/useWebAuthn.js` hook for WebAuthn device binding.
- Add or update the architecture diagram in `ArchitecturePage.jsx` when the full backend flow is ready.

---

## License

This repository is for the PrivaKYC hackathon frontend implementation.
