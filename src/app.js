const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to Database
const connectDB = require('./config/db');
connectDB();

const app = express();

// Security Middlewares
app.use(helmet());

// Updated CORS to allow local HTML files (origin: null) for the demo
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true); // Allow all origins for demo
  },
  credentials: true
}));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
const auditLogger = require('./middleware/auditLogger');
const kycRoutes = require('./routes/kyc.routes');
const ekycRoutes = require('./routes/ekyc.routes');
const { initiateLiveKyc, verifyLiveKyc } = require('./controllers/ekyc.controller');
const webauthnRoutes = require('./routes/webauthn.routes');
const zkRoutes = require('./routes/zk.routes');
const algorandRoutes = require('./routes/algorand.routes');
const verifierRoutes = require('./routes/verifier.routes');
const tokenRoutes = require('./routes/token.routes');
const complianceRoutes = require('./routes/compliance.routes');
const digilockerRoutes = require('./routes/digilocker.routes');
const fraudRoutes = require('./routes/fraud.routes');
const voiceRoutes = require('./routes/voice.routes');

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running' });
});

app.use('/api', kycRoutes);
app.use('/api', ekycRoutes);
// Hard-mounted endpoints (ensures availability even if router mounting changes)
app.post('/api/ekyc/live/initiate', initiateLiveKyc);
app.post('/api/ekyc/live/verify', verifyLiveKyc);
app.use('/api/webauthn', webauthnRoutes);
app.use('/api/zk', zkRoutes);
app.use('/api/algorand', algorandRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/digilocker', digilockerRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/voice', voiceRoutes);

// Debug helper (safe): list mounted routes for integration sanity checks
app.get('/api/_routes', (req, res) => {
  const stack = app?._router?.stack || [];
  const routes = [];

  for (const layer of stack) {
    if (layer?.route?.path) {
      routes.push({ method: Object.keys(layer.route.methods || {})[0], path: layer.route.path });
    } else if (layer?.name === 'router' && layer?.handle?.stack) {
      for (const r of layer.handle.stack) {
        if (r?.route?.path) {
          routes.push({ method: Object.keys(r.route.methods || {})[0], path: r.route.path });
        }
      }
    }
  }

  res.status(200).json({ success: true, count: routes.length, routes });
});

// Immutable audit logging for all API interactions (best-effort, runs after handlers)
app.use('/api', auditLogger);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
