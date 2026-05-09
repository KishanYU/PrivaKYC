require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sponsorRoutes = require('./src/sponsors/sponsor.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mount the sponsor routes exactly as requested
app.use('/api/sponsors', sponsorRoutes);

// Basic health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'PrivaKYC Sponsor Modules Mock Server' });
});

app.listen(PORT, () => {
    console.log(`Mock server running on port ${PORT}`);
    console.log(`Test endpoints at:`);
    console.log(`- POST http://localhost:${PORT}/api/sponsors/voice/challenge`);
    console.log(`- POST http://localhost:${PORT}/api/sponsors/voice/verify`);
});
