# How to Demo the 15-Word Emergency Revocation

This feature is designed for your live pitch. 
The scenario: "What if the user's phone is stolen, and they can't access Pera Wallet or use WebAuthn biometrics to revoke their identity?"

**The Solution:** The 15-Word Emergency Recovery Phrase.

### Step 1: Generating the Phrase (During Demo)
When you create a new identity via the backend `/api/algorand/register-token`, the response now comes back with a `mnemonic` field.
It looks like this: `abandon amount liar amount expire ... (15 words)`

**Action:** Copy those 15 words onto a notepad or show them clearly on the screen.

### Step 2: Pitch the Disaster Scenario
Tell the judges: *"My primary device was just crushed by a car. A hacker is trying to use my identity at HDFC Bank."*

### Step 3: Trigger the Emergency Kill Switch (From ANY Laptop)
You can go to any other laptop, open a terminal (or a basic UI panel your frontend guy connects), and hit the emergency backend route using **ONLY** the 15 words.

```bash
curl -X POST http://localhost:5000/api/algorand/emergency-revoke \
-H "Content-Type: application/json" \
-d '{"mnemonic": "abandon amount liar amount expire ... (your 15 words)"}'
```

### Step 4: The Result
The backend will immediately take the hash of your phrase, execute a search through MongoDB, locate your Identity Nullifier, and instantly blast out the `REVOKED` transaction to the blockchain and nullify your token.

The Bank Verifier will instantly return: `STATUS: REJECTED_REVOKED`.
