# PrivaKYC — Sponsor-Powered Fraud Intelligence Layer

PrivaKYC is a privacy-preserving identity verification platform. This repository contains the **Adaptive Security & Compliance Layer**, which uses Zero-Knowledge Proofs (ZKPs) combined with AI-driven risk analysis and biometric liveness to prevent identity fraud.

## 🚀 Key Features

### 1. Intelligent Risk Engine
- **Context-Aware Scoring**: Dynamically analyzes verification attempts based on device fingerprints, IP metadata, and historical frequency.
- **Realistic Data Simulation**: Uses a baseline risk model with randomized jitter to simulate real-world data science outputs.
- **Adaptive Branching**: Automatically triggers higher security (Voice Liveness) only when risk thresholds are breached.

### 2. Biometric Voice Liveness (ElevenLabs)
- **Dynamic Challenges**: Generates unique 4-digit codes for users to speak.
- **Bi biometric Authentication**: Uses ElevenLabs Speech-to-Text to verify the user's identity in real-time, preventing deepfakes and bot attacks.

### 3. Shared Fraud Intelligence (Snowflake)
- **Cross-Institution Alerts**: High-risk events and biometric failures are logged to a shared Snowflake instance.
- **Fraud Heatmap**: Real-time visualization of suspicious KYC attempts across the network.

### 4. Immutable Audit Logging (Backbone.io)
- **Compliance Ready**: Every verification lifecycle event is recorded on an immutable ledger via Backbone.io.
- **Regulator Friendly**: Provides a transparent, tamper-proof audit trail for identity clearance.

---

## 🛠️ Technology Stack
- **Frontend**: React (Vite), Tailwind CSS, Axios.
- **Backend**: Node.js, Express.
- **Biometrics**: ElevenLabs API.
- **Data Warehouse**: Snowflake.
- **Audit Ledger**: Backbone.io.

---

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jc-kirthi/PrivaKYC---Sponsor-Layer-Integration.git
   cd PrivaKYC---Sponsor-Layer-Integration
   ```

2. **Install dependencies**:
   ```bash
   # Root (Backend)
   npm install

   # Frontend
   cd frontend
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory and add your API keys:
   ```env
   ELEVENLABS_API_KEY=your_key_here
   # Add other sponsor keys as needed
   ```

4. **Run the application**:
   ```bash
   # Start Backend (from root)
   npm run dev

   # Start Frontend (from frontend folder)
   npm run dev
   ```

---

## 🖥️ How to Use (Demo Guide)

The platform includes a **Scenario Profiler** to make demonstrations effortless:

1. **Normal User**: Select this to demonstrate a frictionless, low-risk ZKP verification flow.
2. **Stolen Proof**: Select this to simulate a revoked identity token. It will instantly trigger a **Snowflake Fraud Alert** and demand a **Voice Liveness** check.
3. **Botnet Attack**: Select this to simulate high-velocity automated attacks. It triggers the highest risk score and requires mandatory biometric verification.

---

## 🏗️ Architecture Flow
1. **User Submits ZKP** -> 2. **Risk Engine Assessment** -> 3. **Branching (Success OR Biometric Challenge)** -> 4. **Fraud/Audit Logging** -> 5. **Final Clearance**.
