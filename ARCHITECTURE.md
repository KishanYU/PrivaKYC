# System Architecture - PrivaKYC

PrivaKYC is a high-assurance, privacy-preserving Identity and KYC platform. It leverages **Zero-Knowledge Proofs (ZKP)**, **Blockchain**, and **Biometric Authentication** to ensure that user data is never exposed while remaining cryptographically verifiable.

## 🏗️ Technical Stack

### Core Layers
- **Frontend**: React (Vite) + Tailwind CSS + Framer Motion. Deployed on **Vercel**.
- **Backend**: Node.js + Express + MongoDB. Deployed on **Render**.
- **ZK-Core**: Circom + SnarkJS (Groth16). Privacy-preserving age and identity verification.
- **Blockchain**: Algorand Layer-1. Immutable registry for credential issuance and revocation.
- **Biometrics**: FIDO2/WebAuthn (Biometric Passkeys) + Voice Verification (ElevenLabs).

## 🧩 Architectural Components

### 1. Zero-Knowledge Identity Layer (`/zk-core`)
Instead of sharing a raw Aadhaar XML or PDF, the system generates a ZK Proof locally. This proof confirms specific attributes (e.g., "User is over 18") without revealing the Date of Birth or UID.

### 2. Biometric Assurance Layer (`/integrations/vendor`)
Integrated with **WebAuthn** for hardware-level biometric signing and **ElevenLabs** for voice-print verification. This ensures the person providing the ZK proof is the actual owner of the identity.

### 3. Blockchain Registry (`/backend/src/services/algorand`)
Every verified identity is minted as a non-transferable token on **Algorand**. This allows instant, permissionless verification by banks while enabling the user or authority to "Revoke" the token if identity theft is suspected.

### 4. Sponsor Risk Engine (`/backend/src/modules/sponsor`)
A proprietary engine that calculates risk scores based on:
- Verification history.
- Voice-print match confidence.
- On-chain reputation.

---

## 🚀 Deployment Strategy
- **Frontend**: Automatic CI/CD via Vercel (root dir: `/frontend`).
- **Backend**: Managed service on Render (root dir: `/backend`).
- **Database**: MongoDB Atlas (Global cluster for low-latency identity lookups).
