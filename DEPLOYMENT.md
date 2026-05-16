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
MONGO_URI=your_mongodb_atlas_uri
CLIENT_URL=your_frontend_url

# Algorand Testnet (Algonode)
ALGOD_SERVER=your_algod_server
ALGOD_PORT=443
ALGOD_TOKEN=
ALGOD_REGISTRY_ADDRESS=your_registry_address

# Indexer
INDEXER_SERVER=your_indexer_server
INDEXER_PORT=443
INDEXER_TOKEN=

PERA_WALLET_NETWORK=testnet
N8N_WEBHOOK_URL=your_n8n_webhook_url
JWT_SECRET=your_jwt_secret
NODE_ENV=production

# Email Notifications (Optional for demo)
BANK_EMAIL=your_email@example.com
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_password

# Sponsor Hot-Wallet (Used for Sponsored KYC Minting)
SPONSOR_MNEMONIC="your 24-word sponsor mnemonic here"
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
VITE_API_BASE_URL=your_backend_url/api
VITE_STATUS_URL=your_backend_url/api/compliance
VITE_N8N_REVOKE_WEBHOOK=your_n8n_webhook_url
```

---

## 📦 Deployment Flow
1. **Push to GitHub**: This repo contains both folders.
2. **Render** will automatically pick up changes from the `backend` folder.
3. **Vercel** will automatically pick up changes from the `frontend` folder.
4. **CORS**: Ensure your Render backend allows the Vercel domain (handled in `app.js`).
