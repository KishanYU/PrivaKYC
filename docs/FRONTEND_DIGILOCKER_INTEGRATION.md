# Frontend Integration Guide: DigiLocker OAuth2 Flow

This guide explains how to implement the "Sign in with DigiLocker" button on the frontend. This allows users to import their verified Identity Data (Aadhaar/DL) directly from the Government's DigiLocker API instead of manually uploading an XML file.

## The Flow Overview
1. User clicks **"Sign in with DigiLocker"**.
2. Frontend requests the secure Government Auth URL from our Backend.
3. Frontend redirects the user to the DigiLocker login page.
4. After login, DigiLocker sends them back to our Backend.
5. Our Backend instantly converts the raw data into a Zero-Knowledge Proof and issues an Access Token.

---

## 1. Get the DigiLocker Login URL

When the user clicks the DigiLocker button, fetch the secure URL:

```javascript
// Function triggered by "Sign in with DigiLocker" button click
async function handleDigiLockerLogin() {
    try {
        const response = await fetch('http://localhost:3000/api/digilocker/auth');
        const data = await response.json();
        
        if (data.success) {
            // Redirect the user's browser to the official DigiLocker portal
            window.location.href = data.authUrl;
        }
    } catch (error) {
        console.error("Failed to fetch DigiLocker URL", error);
    }
}
```

---

## 2. Handling the Callback (Post-Login)

*Note: In our current Hackathon backend setup, the DigiLocker callback (`/api/digilocker/callback`) returns a JSON response containing the `accessToken` and data directly.*

If you are using a popup window for the login, or if you prefer to simulate the callback manually for the demo without leaving the page, you can call it directly:

```javascript
async function processDigiLockerData() {
    // In a real flow, DigiLocker appends ?code=XYZ to the URL when redirecting back.
    // For the demo, we send a mock code to our backend callback endpoint.
    const mockCode = "hackathon_auth_code_999";
    
    const response = await fetch(`http://localhost:3000/api/digilocker/callback?code=${mockCode}`);
    const data = await response.json();
    
    if (data.success) {
        console.log("DigiLocker Token:", data.accessToken);
        console.log("User Data for ZK:", data.extractedData);
        
        // 🚀 Next step: Take data.extractedData.dob and send it to our 
        // ZK Proof generation endpoint!
        await generateZeroKnowledgeProof(data.extractedData.dob);
    }
}
```

---

## 3. Generate ZK Proof using the DigiLocker Data

Once you have the `dob` from DigiLocker, push it straight into the ZK compiler endpoint we built. (This ensures we never store the DigiLocker data permanently).

```javascript
async function generateZeroKnowledgeProof(dobString) {
    const response = await fetch('http://localhost:3000/api/zk/generate-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dob: dobString })
    });
    
    const zkData = await response.json();
    
    if (zkData.success) {
        console.log("ZK Proof Generated!", zkData.proof);
        console.log("Nullifier Token ID:", zkData.tokenId);
        
        // You can now proceed to the Algorand Anchoring Step using zkData.tokenId!
    }
}
```

## Hackathon Pitch Note for Frontend:
Make sure the UI reflects that the data is loaded **ephemerally** (temporarily in RAM). Show a cool animation saying: `"Importing from DigiLocker -> Generating Zero-Knowledge Math Proof -> Erasing Raw Data"` to impress the judges!
