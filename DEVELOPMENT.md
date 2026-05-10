# Development Guide - PrivaKYC

This document provides detailed information for developers who wish to build, test, and extend the PrivaKYC protocol.

## 🛠️ Tech Stack Deep Dive

### 1. ZK-Circuit Logic (`/zk-core`)
- **Language**: Circom 2.1.0
- **Proof System**: Groth16 (snarkjs)
- **Curve**: BN128
- **Goal**: Verify that a user's age is within a specific range and that their nationality matches a whitelist, without revealing the underlying Aadhaar data.

### 2. Algorand Layer-1 (`/backend/src/services/algorand`)
- **Registry**: We use **Algorand Standard Assets (ASA)** to represent an identity token.
- **Clawback/Freeze**: The protocol manager (PrivaKYC) holds clawback rights to allow for verifiable revocation if a device is reported lost.
- **Note Field**: We store the SHA-256 hash of the ZK proof in the transaction note field for immutable on-chain verification.

### 3. Biometric Passkeys (`/frontend/src/hooks/useWebAuthn.js`)
- **Standard**: FIDO2 / WebAuthn.
- **Security**: The private key never leaves the user's hardware security module (TPM/Secure Enclave).
- **Binding**: We bind the Algorand token ID to the WebAuthn `credentialId`.

## 🧪 Testing Environment

### Running Local ZK-Compiler
If you wish to modify the circuits:
```bash
cd zk-core
# Requires circom binary and snarkjs
circom circuit.circom --r1cs --wasm --sym
snarkjs groth16 setup circuit.r1cs pot12_final.ptau circuit_0000.zkey
```

### Mocking DigiLocker
The system includes a **Sandbox Mode**. When `NODE_ENV=development`, the DigiLocker controller will bypass real OIDC checks and use mock Government data for testing.

## 📈 Performance Metrics
- **Proof Generation**: ~2.4 seconds on modern browsers.
- **On-Chain Confirmation**: ~3.4 seconds (Algorand Block Time).
- **Verification Latency**: <100ms.

---
*For business inquiries, refer to BUSINESS_USP.md.*
