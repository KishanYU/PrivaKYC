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
Add the following in the Render Dashboard:
- `PORT`: `5000` (or leave blank for Render default)
- `MONGO_URI`: Your MongoDB connection string.
- `NODE_ENV`: `production`
- `JWT_SECRET`: A long random string.
- `ALGOD_SERVER`: `https://testnet-api.algonode.cloud` (example)
- `ALGOD_PORT`: `443`
- `ALGOD_TOKEN`: (Leave empty for Algonode)
- `N8N_WEBHOOK_URL`: Your n8n workflow URL.
- `BANK_EMAIL`: `pavu586@gmail.com`
- `EMAIL_USER`: Your SMTP user.
- `EMAIL_PASS`: Your SMTP password.

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
- `VITE_API_BASE_URL`: The URL of your **Render backend** service + `/api` (e.g., `https://privakyc-backend.onrender.com/api`).
- `VITE_STATUS_URL`: Your backend URL + `/api/compliance`.
- `VITE_N8N_REVOKE_WEBHOOK`: Your n8n revocation webhook.

---

## 📦 Deployment Flow
1. **Push to GitHub**: This repo contains both folders.
2. **Render** will automatically pick up changes from the `backend` folder.
3. **Vercel** will automatically pick up changes from the `frontend` folder.
4. **CORS**: Ensure your Render backend allows the Vercel domain (already handled in `app.js` with permissive CORS for demo).
