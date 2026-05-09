# Frontend Integration Guide for Real Algorand (Pera Wallet)

This guide is for the **Frontend Team** to integrate the Real Algorand Blockchain features into the UI (React/Next.js/HTML).

Since we upgraded the backend to support genuine Pera Wallet signatures instead of backend-simulated mocks, the frontend must execute the transaction signing.

## Prerequisites
You need the `@perawallet/connect` and `algosdk` libraries in your frontend project.
```bash
npm install @perawallet/connect algosdk
```

---

## 1. Register Token (Identity Anchoring)

When the user passes ZK Age Verification, we anchor their anonymous `tokenId` and `proofHash` to Algorand.

### Step A: Request the Unsigned Transaction from our Backend
```javascript
const response = await fetch('http://localhost:3000/api/algorand/build-register-txn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        sender: senderWalletAddress, // Address the user connected via Pera
        tokenId: "generated-uuid-token",
        proofHash: "0xProofHashString"
    })
});
const { unsignedTxnBase64 } = await response.json();
```

### Step B: User Signs via Pera Wallet
Decode the base64 transaction and prompt the user to sign it on their phone.
```javascript
import { PeraWalletConnect } from "@perawallet/connect";
const peraWallet = new PeraWalletConnect();

// Base64 to Uint8Array
const txnBytes = Uint8Array.from(atob(unsignedTxnBase64), c => c.charCodeAt(0));

// Request signature from user
const signedTxnGroups = await peraWallet.signTransaction([[{ txn: txnBytes, signers: [senderWalletAddress] }]]);
const signedTxnBytes = signedTxnGroups[0];
```

### Step C: Submit the Signed Transaction back to our Backend
```javascript
const encodedSignedTxn = btoa(String.fromCharCode.apply(null, signedTxnBytes));

const submitRes = await fetch('http://localhost:3000/api/algorand/submit-register-txn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        signedTxnBase64: encodedSignedTxn,
        tokenId: "generated-uuid-token"
    })
});
const { txId } = await submitRes.json();
console.log("Successfully anchored to Algorand! TxID:", txId);
```

---

## 2. Instant Zero-Knowledge Revocation

When a user clicks "Revoke KYC Identity" in their dashboard.

### Step A: Request Unsigned Revoke Transaction
```javascript
const response = await fetch('http://localhost:3000/api/algorand/build-revoke-txn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        sender: senderWalletAddress,
        tokenId: "generated-uuid-token"
    })
});
const { unsignedTxnBase64 } = await response.json();
```

### Step B & C: Sign & Submit (Same as above)
Follow the exact same Pera Wallet signing logic and send the result to `/api/algorand/submit-revoke-txn`.
