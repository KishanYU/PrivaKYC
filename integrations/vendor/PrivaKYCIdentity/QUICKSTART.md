# Quick Start Guide - Identity Bridge Full Stack Integration

## Project Structure

```
identity-bridge-full-stack/
├── backend/
│   ├── server.js              # Express server
│   ├── package.json
│   ├── .env
│   └── identity-bridge/       # (symlink or copy the module)
│       ├── src/
│       ├── node_modules/
│       └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── KYCForm.jsx    # React component
    │   ├── styles/
    │   │   └── KYCForm.css    # Styling
    │   ├── App.jsx
    │   └── index.js
    ├── package.json
    └── .env
```

---

## Backend Setup (5 minutes)

### Step 1: Create Backend Directory Structure

```bash
mkdir identity-bridge-full-stack
cd identity-bridge-full-stack
mkdir backend frontend

# Copy Identity Bridge module
cp -r identity-bridge backend/
cd backend
```

### Step 2: Install Backend Dependencies

```bash
npm install express cors uuid axios dotenv

# Verify dependencies
npm list
```

### Step 3: Create `.env` File

```bash
# backend/.env
PORT=3000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Setu API Config
SETU_CLIENT_ID=your_client_id
SETU_CLIENT_SECRET=your_client_secret
SETU_PRODUCT_INSTANCE_ID=your_instance_id
SETU_BASE_URL=https://dg-sandbox.setu.co/api
SETU_OAUTH_URL=https://auth.setu.co/oauth/token
SETU_OAUTH_SCOPE=ekyc
AADHAAR_SALT=your_secret_salt

# Mock Mode (use true for development)
USE_MOCK=true
```

### Step 4: Copy Server File

Place `server.js` in the `backend/` directory

### Step 5: Update Backend `package.json`

```json
{
  "name": "kyc-backend",
  "version": "1.0.0",
  "description": "Identity Bridge Backend Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "node -e \"console.log('Tests run here')\""
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "uuid": "^9.0.0",
    "axios": "^1.6.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

### Step 6: Test Backend

```bash
# Terminal 1: Run backend server
npm start

# Terminal 2: Test API
curl -X POST http://localhost:3000/api/kyc/initiate \
  -H "Content-Type: application/json" \
  -d '{"aadhaarNumber":"123456789012"}'

# Expected response:
# {"success":true,"transactionId":"mock-txn-123","expiresIn":600}
```

---

## Frontend Setup (5 minutes)

### Step 1: Create React App

```bash
cd frontend
npx create-react-app . --template

# OR install manually
npm init -y
npm install react react-dom axios
npm install --save-dev @vitejs/plugin-react vite
```

### Step 2: Create Component Files

Place these files in your React project:
- `src/components/KYCForm.jsx` → Copy from KYCForm.jsx
- `src/styles/KYCForm.css` → Copy from KYCForm.css

### Step 3: Create `.env` File

```bash
# frontend/.env
REACT_APP_API_URL=http://localhost:3000
REACT_APP_ENV=development
```

### Step 4: Update `src/App.jsx`

```javascript
import React from 'react';
import KYCForm from './components/KYCForm';
import './styles/KYCForm.css';

function App() {
  return (
    <div className="App">
      <KYCForm />
    </div>
  );
}

export default App;
```

### Step 5: Update `package.json`

```json
{
  "name": "kyc-frontend",
  "version": "1.0.0",
  "description": "Identity Bridge Frontend",
  "main": "src/index.js",
  "scripts": {
    "start": "react-scripts start",
    "dev": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test"
  },
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "react-scripts": "5.0.0"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version"]
  }
}
```

### Step 6: Test Frontend

```bash
npm start

# Opens http://localhost:3000
```

---

## Running Both Together

### Option 1: Separate Terminals

```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm start
```

### Option 2: Using Concurrently

In root `package.json`:

```json
{
  "scripts": {
    "start": "concurrently \"cd backend && npm start\" \"cd frontend && npm start\""
  },
  "devDependencies": {
    "concurrently": "^8.0.0"
  }
}
```

Then run:
```bash
npm install concurrently
npm start
```

---

## API Testing Guide

### Test 1: Initiate KYC

```bash
# Using curl
curl -X POST http://localhost:3000/api/kyc/initiate \
  -H "Content-Type: application/json" \
  -d '{"aadhaarNumber":"123456789012"}'

# Using PowerShell
$body = @{ aadhaarNumber = "123456789012" } | ConvertTo-Json
Invoke-WebRequest -Uri "http://localhost:3000/api/kyc/initiate" \
  -Method POST -ContentType "application/json" -Body $body

# Response:
# {
#   "success": true,
#   "transactionId": "mock-txn-123",
#   "expiresIn": 600
# }
```

### Test 2: Verify OTP

```bash
# Using curl
curl -X POST http://localhost:3000/api/kyc/verify \
  -H "Content-Type: application/json" \
  -d '{"transactionId":"mock-txn-123","otp":"123456"}'

# Response:
# {
#   "success": true,
#   "sessionId": "uuid-here",
#   "claims": {
#     "ageOver18": true,
#     "state": "Karnataka",
#     "userHash": "hash..."
#   }
# }
```

### Test 3: Health Check

```bash
curl http://localhost:3000/health

# Response:
# {
#   "status": "OK",
#   "timestamp": "2026-05-08T18:30:00.000Z",
#   "uptime": 125.456
# }
```

---

## Debugging Tips

### Enable Request Logging

Add to backend:
```javascript
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

### Check Browser Console

In Frontend DevTools:
```javascript
// Check API calls
console.log('API URL:', process.env.REACT_APP_API_URL);
```

### Monitor Transaction Store

Add to backend URL bar:
```
http://localhost:3000/api/stats
```

Shows active transactions for debugging

---

## Common Issues & Solutions

### Issue: CORS Error in Frontend

**Solution:** Ensure backend has correct CORS config:
```javascript
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true
};
app.use(cors(corsOptions));
```

### Issue: Aadhaar Validation Fails

**Solution:** Ensure 12 digits without spaces:
```javascript
const cleaned = value.replace(/\D/g, '');
// cleaned.length must be === 12
```

### Issue: OTP Endpoint Returns 404

**Solution:** Check backend is running:
```bash
curl http://localhost:3000/health
```

### Issue: Frontend Can't Connect to Backend

**Solution:** Verify API URL in `.env`:
```
REACT_APP_API_URL=http://localhost:3000
```

---

## Production Deployment

### Backend Deployment (Heroku Example)

```bash
cd backend
heroku create your-app-name
heroku config:set SETU_CLIENT_ID=xxx SETU_CLIENT_SECRET=xxx
git push heroku main
```

### Frontend Deployment (Vercel Example)

```bash
cd frontend
npm install -g vercel
vercel

# Set environment variables in Vercel dashboard:
# REACT_APP_API_URL=https://your-backend.herokuapp.com
```

---

## Security Checklist

- [ ] Use environment variables for secrets
- [ ] Enable HTTPS in production
- [ ] Set proper CORS origin
- [ ] Add rate limiting
- [ ] Implement request signing
- [ ] Add input validation
- [ ] Use secure session management
- [ ] Monitor transaction cleanup
- [ ] Add audit logging
- [ ] Implement authentication

---

## Next Steps

1. **Add Database**: Replace in-memory store with PostgreSQL/MongoDB
2. **User Management**: Add login/register system
3. **Enhanced Security**: Add JWT tokens, request signing
4. **UI Improvements**: Add animations, accessibility
5. **Monitoring**: Add logging and alerting
6. **Testing**: Add unit and integration tests

---

## Resources

- [Setu e-KYC Documentation](https://docs.setu.co/data/ekyc)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Axios Documentation](https://axios-http.com/)