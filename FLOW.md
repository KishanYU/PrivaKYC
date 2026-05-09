# User & Data Flow - PrivaKYC

This document visualizes the high-integrity flow of data from the User to the Verifier (Bank) using the PrivaKYC protocol.

## 🔄 The KYC Lifecycle

```mermaid
sequenceDiagram
    participant U as User (Frontend)
    participant B as PrivaKYC Backend
    participant ZK as ZK-Core (Local)
    participant ALGO as Algorand Ledger
    participant BANK as Bank Verifier

    U->>B: 1. Request Challenge (WebAuthn)
    B-->>U: Return Challenge
    U->>U: 2. Biometric Sign (Fingerprint/FaceID)
    U->>ZK: 3. Input Aadhaar XML
    ZK->>ZK: Generate Groth16 Proof
    U->>B: 4. Submit Proof + Voice Sample
    B->>B: 5. Verify Voice (ElevenLabs)
    B->>ALGO: 6. Mint KYC Token (Identity ASA)
    B-->>U: Success (Token ID Issued)
    
    Note over U, BANK: Verification Step
    
    BANK->>B: 7. Request Verification (Token ID)
    B->>ALGO: 8. Check Token Status (Active/Revoked)
    ALGO-->>B: Status: Active
    B-->>BANK: 9. Access Granted (Identity Validated)
```

## 🛠️ Components Mapping
- **Step 3 (ZK Generation)**: Handled by `/zk-core/circuits/age_proof.circom`.
- **Step 6 (Minting)**: Handled by `/backend/src/services/algorand/algorandService.js`.
- **Step 8 (Status)**: Queries the Algorand Indexer via `/backend/src/routes/algorand.routes.js`.
