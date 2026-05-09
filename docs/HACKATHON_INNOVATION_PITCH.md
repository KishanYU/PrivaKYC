# PrivaKYC: Pitch & Innovation Document

## 🌟 The Core Problem
Traditional KYC (Know Your Customer) systems are fundamentally broken. When a user verifies their identity for a bank or service, they are forced to hand over highly sensitive PII (Personally Identifiable Information) like their exact Date of Birth, Aadhaar Number, and Address. This creates massive central honeypots of data, leading to inevitable data breaches and identity theft.

## 🚀 The PrivaKYC Solution
**"Zero-Data KYC with Instant Decentralized Revocation"**
PrivaKYC allows users to prove things *about* their identity (e.g., "I am over 18") without ever actually sharing the underlying identity data with the verifier or the backend server. If a user feels compromised, they can instantly revoke their identity access globally using the blockchain.

---

## 🏆 Why This Architecture is Unique (Our Hackathon Edge)

### 1. True Zero-Knowledge Proofs (ZKP) via Circom & SnarkJS
Instead of a bank checking your Date of Birth, our system uses a custom cryptographic circuit.
- **How it works:** We wrote an original `age_proof.circom` circuit. It takes the current year and the threshold (18) as public inputs, and the user's specific birth year as a completely **private input**. It generates a cryptographic `.wasm` artifact to prove mathematically that the user is over 18, generating a `proof.json`.
- **Why it matters:** The bank (Verifier) only receives a mathematical proof and a public verification key. They never see the DOB. We wrote the circuit from scratch!

### 2. Stateless "No-Storage" Express Backend
Most hackathon projects just save uploaded files to MongoDB.
- **How it works:** Our Express backend uses `multer` with `memoryStorage`. When an Aadhaar offline XML is uploaded, we extract the data, verify the Government's digital signature (`xmldsig`), issue a temporary token, and **instantly destroy the file from memory**. 
- **Why it matters:** Even if our database is completely hacked, there is exactly zero PII to steal.

### 3. Biometric Passkey Binding (WebAuthn / FIDO2)
Instead of easily stolen passwords or SMS OTPs, we bind the KYC session to the physical device.
- **How it works:** By leveraging `@simplewebauthn`, we trigger the user's on-device biometric sensor (FaceID / Fingerprint) to cryptographically sign the session.
- **Why it matters:** You prove that you are not just a bot holding an Aadhaar XML, but a physically present human possessing the registered secure enclave hardware.

### 4. Global Decentralized Revocation via Algorand
A centralized database for "active/revoked" statuses is a single point of failure.
- **How it works:** We issue a digital representation of the KYC clearance on the Algorand Blockchain. To revoke access, the user signs a transaction via Pera Wallet (or automated logic). Webhooks (`n8n` integration) listen to these on-chain state changes. 
- **Why it matters:** Users are in full control of their identity. Revocation is public, immutable, and immediate across all connected banks.

---

## 🛠️ Project Timeline & Proven Originality
To protect the integrity of the project:
- **No external repositories were cloned.** We used raw package managers (`npm`) and standard binaries (`circom.exe`). 
- **The architecture was built modularly:** 
  - Phase 1-2: Secure API & Aadhaar XML signature validation.
  - Phase 3: Hardware biometrics validation.
  - Phase 4: Custom Zero-Knowledge cryptography compilation.
  - Phase 5-6: Smart Contract & Blockchain Event hooks.

**This is a production-grade, highly defensible architecture that easily answers the hardest judge questions regarding data privacy (DPDP Act compliance) and security.**