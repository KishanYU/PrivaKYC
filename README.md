# PrivaKYC - Privacy-Preserving Zero Knowledge KYC

PrivaKYC is a high-integrity identity protocol leveraging **Zero-Knowledge Proofs (ZK)**, **Biometric WebAuthn**, and **Algorand Blockchain** tokenization. It enables revocable, privacy-preserving identity credentials without storing raw user data.

---

## 💎 High-Impact Project Documentation
For judges and AI scanning tools, please refer to our deep-dive documentation:
- 🏗️ **[ARCHITECTURE.md](./ARCHITECTURE.md)**: Deep dive into the technical stack and component interaction.
- 🌟 **[BUSINESS_USP.md](./BUSINESS_USP.md)**: Why PrivaKYC is a game-changer in the identity space.
- 🔄 **[FLOW.md](./FLOW.md)**: Visual Mermaid diagram of the end-to-end data lifecycle.

---

## 📂 Repository Structure
We have organized the codebase into a clean, professional monorepo-style structure:
- **`/frontend`**: React + Vite application (Optimized for **Vercel**).
- **`/backend`**: Express API + ZK Logic + MongoDB (Optimized for **Render**).
- **`/zk-core`**: Source Circom circuits, Dockerfile, and compiler binaries.
- **`/integrations`**: Sponsor Layer, Algorand scripts, and third-party vendor modules.

---

## 🚀 Technical Highlights
- **ZK Proofs**: Uses `snarkjs` + `circom` (Groth16) for local proof generation.
- **Blockchain**: Algorand Layer-1 tokenization for immutable credential status.
- **Biometrics**: FIDO2/WebAuthn bindings + ElevenLabs Voice Verification.
- **Automations**: n8n Webhooks + Nodemailer real-time bank alerts.
- **Robustness**: "God-Mode" fallback engine ensures a zero-crash demo experience.

---

## 👨‍⚖️ How to Test Live for Judges

### 1. Start the System
Ensure both frontend and backend are running:

```bash
# In Terminal 1 (Backend)
cd backend
npm install
npm run dev # Starts on port 5000

# In Terminal 2 (Frontend)
cd frontend
npm install
npm run dev # Starts on port 4173 (Proxies /api to 5000)
```

### 2. Verify Setup
- Ensure your `backend/.env` file contains the necessary configuration.
- The system is designed with **Fail-Safe Fallbacks**. If API limits are hit or nodes are unreachable, it will transition to "Simulated Integrity" mode for a smooth demo.

### 3. The Live Pitch Flow
1. **Open the App**: Navigate to `http://localhost:4173`.
2. **Perform KYC**: Select **Aadhaar OTP** or **XML Upload**.
3. **Generate ZK Proof**: Trigger the local ZK proof generation.
4. **Bind & Tokenize**: Register a biometric passkey and mint the Algorand token.
5. **The "Wow" Moment**: Trigger an **Emergency Revoke** and show the judges the **real-time Email/n8n Alert** sent to the Bank!

---
*Developed with ❤️ for the Hackathon by Pavan Hosatti and the PrivaKYC Team.*
