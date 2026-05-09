const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadXml } = require('../controllers/kyc.controller');

// Use memory storage to ensure the raw Aadhaar XML is never saved to the local file system
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// @route   POST /api/upload-xml
// @desc    Upload offline Aadhaar XML, verify signature, and extract safe info
router.post('/upload-xml', upload.single('aadhaarXml'), uploadXml);

module.exports = router;
