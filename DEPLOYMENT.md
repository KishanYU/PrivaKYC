# Deployment Guide - PrivaKYC

This document provides step-by-step instructions for deploying the PrivaKYC monorepo.

## 🚀 Repository Structure
The project is organized for multi-platform deployment:
- **/backend**: Express API (Deploy to Render)
- **/frontend**: React/Vite App (Deploy to Vercel)
- **/zk-core**: Source circuits and binaries (Not deployed, but kept for reference)
- **/integrations**: Third-party modules and scripts (Not deployed)

---

## 🏗️ Backend Deployment (Render)

### 1. Create a Web Service on Render
- **Repository**: Connect this GitHub repo.
- **Root Directory**: `backend` (Crucial!)
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start` (or `node src/app.js`)

### 2. Environment Variables (Backend)
Add the following in the Render Dashboard or create a `backend/.env` file:

```env
PORT=5000
# Real MongoDB Atlas URI (Update password if needed)
MONGO_URI=mongodb://pavu586_db_user:pavu1234@ac-qdpm7oo-shard-00-00.vpqaxfi.mongodb.net:27017,ac-qdpm7oo-shard-00-01.vpqaxfi.mongodb.net:27017,ac-qdpm7oo-shard-00-02.vpqaxfi.mongodb.net:27017/?ssl=true&replicaSet=atlas-1419n3-shard-0&authSource=admin&retryWrites=true&w=majority
CLIENT_URL=https://priva-kyc.vercel.app

# Algorand Testnet (Algonode)
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_PORT=443
ALGOD_TOKEN=
ALGOD_REGISTRY_ADDRESS=V2BESTC7IDRSUDOGPL4DTTFM5QGOBH7CLHFPHG4R63S6TRRQXEZ5DDUMJE

# Indexer
INDEXER_SERVER=https://testnet-idx.algonode.cloud
INDEXER_PORT=443
INDEXER_TOKEN=

PERA_WALLET_NETWORK=testnet
N8N_WEBHOOK_URL=https://jckirthi.app.n8n.cloud/webhook/revoke-token
JWT_SECRET=supersecretjwtkey_change_in_production
NODE_ENV=production

# Email Notifications (Optional for demo)
BANK_EMAIL=pavu586@gmail.com
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_password

# Sponsor Hot-Wallet (Used for Sponsored KYC Minting)
SPONSOR_MNEMONIC="hawk price actress element step addict reform supreme drastic sorry lunch draft once good wisdom scrub junior puzzle artist original roof injury eyebrow abstract unaware"
```

---

## 🎨 Frontend Deployment (Vercel)

### 1. Create a Project on Vercel
- **Repository**: Connect this GitHub repo.
- **Root Directory**: `frontend` (Crucial!)
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 2. Environment Variables (Frontend)
Add the following in the Vercel Dashboard:

```env
# Change this to your actual Render URL after deploying backend
VITE_API_BASE_URL=https://privakyc.onrender.com/api
VITE_STATUS_URL=https://privakyc.onrender.com/api/compliance
VITE_N8N_REVOKE_WEBHOOK=https://jckirthi.app.n8n.cloud/webhook/revoke-token
```

---

## 📦 Deployment Flow
1. **Push to GitHub**: This repo contains both folders.
2. **Render** will automatically pick up changes from the `backend` folder.
3. **Vercel** will automatically pick up changes from the `frontend` folder.
4. **CORS**: Ensure your Render backend allows the Vercel domain (handled in `app.js`).
