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
MONGO_URI=your_mongodb_connection_string
CLIENT_URL=https://your-frontend-vercel-url.vercel.app

ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_PORT=443
ALGOD_TOKEN=
ALGOD_REGISTRY_ADDRESS=your_algorand_app_id

INDEXER_SERVER=https://testnet-idx.algonode.cloud
INDEXER_PORT=443
INDEXER_TOKEN=

PERA_WALLET_NETWORK=testnet
N8N_WEBHOOK_URL=your_n8n_webhook_url
JWT_SECRET=your_secure_random_jwt_secret
NODE_ENV=production

# Email Notifications (Optional for demo)
BANK_EMAIL=pavu586@gmail.com
EMAIL_USER=your_smtp_user
EMAIL_PASS=your_smtp_password
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
VITE_API_BASE_URL=https://your-backend-render-url.onrender.com/api
VITE_STATUS_URL=https://your-backend-render-url.onrender.com/api/compliance
VITE_N8N_REVOKE_WEBHOOK=https://jckirthi.app.n8n.cloud/webhook/revoke-token
```

---

## 📦 Deployment Flow
1. **Push to GitHub**: This repo contains both folders.
2. **Render** will automatically pick up changes from the `backend` folder.
3. **Vercel** will automatically pick up changes from the `frontend` folder.
4. **CORS**: Ensure your Render backend allows the Vercel domain (handled in `app.js`).
