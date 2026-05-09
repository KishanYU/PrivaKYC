const crypto = require('crypto');

/**
 * Service to handle Backboard.io Agent Memory Layer.
 * Features: Persistent context, Redaction of sensitive fields, Memory fallback.
 */

// In-memory fallback for agent memory context logs (when Backboard.io is unavailable)
const memoryLogsStore = [];

class MemoryService {
    /**
     * Redact sensitive fields from payloads before logging.
     */
    static redactPayload(payload) {
        if (!payload) return null;
        const redacted = { ...payload };
        const sensitiveKeys = ['password', 'secret', 'token', 'audio', 'aadhaar'];
        
        Object.keys(redacted).forEach(key => {
            if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
                redacted[key] = '[REDACTED]';
            }
        });
        return redacted;
    }

    /**
     * Log a business event (e.g., proof generation, verification success/failure)
     * 
     * @param {string} eventType - The type of business event
     * @param {string} userId - Anonymized user identifier
     * @param {Object} metadata - Additional event metadata
     */
    static async logEvent(eventType, userId, metadata = {}) {
        const timestamp = new Date().toISOString();
        const redactedMetadata = this.redactPayload(metadata);

        const memoryRecord = {
            id: crypto.randomUUID(),
            timestamp,
            event_type: eventType,
            user_id: userId || 'anonymous',
            metadata: redactedMetadata
        };

        try {
            if (process.env.BACKBOARD_API_KEY === 'MLHNMIT' || process.env.BACKBOARD_API_KEY) {
                // Here we would call the Backboard.io API:
                // await axios.post('https://api.backboard.io/v1/memory', memoryRecord, { headers: ... })
                await this.mockBackboardApiCall();
                console.log(`[BACKBOARD] Context stored: ${eventType}`);
            } else {
                throw new Error('Backboard.io not configured');
            }
        } catch (error) {
            // Fallback to local memory log store
            console.log(`[MEMORY FALLBACK] Context stored: ${eventType}`);
            memoryLogsStore.push(memoryRecord);
        }

        return memoryRecord;
    }

    /**
     * Store HTTP Request Context via Middleware
     */
    static async logRequest(requestData) {
        try {
            if (process.env.BACKBOARD_API_KEY === 'MLHNMIT' || process.env.BACKBOARD_API_KEY) {
                await this.mockBackboardApiCall();
            } else {
                memoryLogsStore.push({ type: 'HTTP_REQUEST_CONTEXT', ...requestData });
            }
        } catch (error) {
            memoryLogsStore.push({ type: 'HTTP_REQUEST_CONTEXT', ...requestData });
        }
    }

    /**
     * Retrieve memory context logs (for demo/admin purposes)
     */
    static async getLogs(limit = 50) {
        // Return latest logs, descending
        return memoryLogsStore.slice().reverse().slice(0, limit);
    }

    static async mockBackboardApiCall() {
        return new Promise(resolve => setTimeout(resolve, 30));
    }
}

module.exports = MemoryService;
