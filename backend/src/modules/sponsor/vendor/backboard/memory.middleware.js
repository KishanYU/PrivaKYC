const crypto = require('crypto');
const MemoryService = require('./memory.service');

/**
 * Express middleware to automatically log API requests to the Backboard.io Agent Memory Layer.
 */
const memoryMiddleware = (req, res, next) => {
    // Capture request start time
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    
    // Hash the request body (excluding sensitive files/buffers if any)
    let bodyHash = null;
    if (req.body && Object.keys(req.body).length > 0) {
        try {
            // Stringify while ignoring circular references just in case
            const bodyStr = JSON.stringify(req.body);
            bodyHash = crypto.createHash('sha256').update(bodyStr).digest('hex');
        } catch (e) {
            bodyHash = 'unhashable_payload';
        }
    }

    // Capture response finish event to get the status code
    res.on('finish', async () => {
        const durationMs = Date.now() - startTime;
        
        // Extract user ID if available in body or headers
        const userId = req.body?.userId || req.headers['x-user-id'] || 'anonymous';

        const requestData = {
            id: crypto.randomUUID(),
            timestamp,
            method: req.method,
            path: req.originalUrl || req.path,
            user_id: userId,
            status_code: res.statusCode,
            body_hash: bodyHash,
            duration_ms: durationMs
        };

        // Log asynchronously so it doesn't block the response
        MemoryService.logRequest(requestData).catch(err => {
            console.error('Failed to log request to MemoryService:', err.message);
        });
    });

    next();
};

module.exports = memoryMiddleware;
