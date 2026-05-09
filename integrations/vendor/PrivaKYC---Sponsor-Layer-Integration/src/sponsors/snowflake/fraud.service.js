/**
 * Service to handle Snowflake Fraud Intelligence logic.
 * Features: Logging fraud alerts, Generating heatmaps, Fallback in-memory mode.
 */

// In-memory fallback store for fraud alerts (used when Snowflake is unavailable)
const fraudAlertsMemoryStore = [];

class FraudService {
    /**
     * Log a new fraud alert into Snowflake (or memory fallback).
     * Requirements: anonymized identities only (no Aadhaar data).
     * 
     * @param {string} alertType - Type of fraud (e.g., 'VOICE_VERIFICATION_FAILED', 'TOKEN_REUSE')
     * @param {string} bankId - Identifier for the banking partner
     * @param {string} nullifierHash - ZK proof nullifier hash (anonymized user ID)
     * @param {number} riskScore - Calculated risk score
     */
    static async logFraudAlert(alertType, bankId, nullifierHash, riskScore) {
        const timestamp = new Date().toISOString();
        const alertRecord = {
            timestamp,
            alert_type: alertType,
            bank_id: bankId,
            nullifier_hash: nullifierHash,
            risk_score: riskScore
        };

        try {
            // Check if Snowflake is configured
            if (process.env.SNOWFLAKE_ACCOUNT) {
                // Here we would use the 'snowflake-sdk' to connect and execute:
                // INSERT INTO FRAUD_ALERTS (timestamp, alert_type, bank_id, nullifier_hash, risk_score) VALUES (...)
                
                // For now, simulate Snowflake API call
                await this.mockSnowflakeInsert(alertRecord);
                console.log(`[SNOWFLAKE] Fraud alert logged: ${alertType} for hash ${nullifierHash}`);
            } else {
                throw new Error('Snowflake not configured');
            }
        } catch (error) {
            // Fallback to local memory mode
            console.log(`[FRAUD FALLBACK] Logging to memory: ${alertType}`);
            fraudAlertsMemoryStore.push(alertRecord);
        }

        return alertRecord;
    }

    /**
     * Get a heatmap of fraud alerts over the last X minutes.
     * @param {number} minutes - Time window in minutes
     */
    static async getFraudHeatmap(minutes) {
        const timeWindowMs = minutes * 60 * 1000;
        const cutoffTime = new Date(Date.now() - timeWindowMs).toISOString();

        try {
            if (process.env.SNOWFLAKE_ACCOUNT) {
                // Here we would execute a Snowflake query:
                // SELECT alert_type, bank_id, COUNT(*) as count, AVG(risk_score) as avg_risk 
                // FROM FRAUD_ALERTS WHERE timestamp >= :cutoffTime GROUP BY alert_type, bank_id
                
                // Simulating response
                return this.mockSnowflakeQuery(cutoffTime);
            } else {
                throw new Error('Snowflake not configured');
            }
        } catch (error) {
            // Fallback: Query the in-memory store
            const recentAlerts = fraudAlertsMemoryStore.filter(a => a.timestamp >= cutoffTime);
            
            // Group by alert_type for a simple heatmap structure
            const heatmap = recentAlerts.reduce((acc, curr) => {
                const key = curr.alert_type;
                if (!acc[key]) acc[key] = { count: 0, totalRisk: 0, alerts: [] };
                acc[key].count += 1;
                acc[key].totalRisk += curr.risk_score;
                acc[key].alerts.push(curr);
                return acc;
            }, {});

            // Calculate averages
            Object.keys(heatmap).forEach(key => {
                heatmap[key].avgRisk = heatmap[key].totalRisk / heatmap[key].count;
                delete heatmap[key].totalRisk;
            });

            return {
                source: 'memory_fallback',
                timeWindowMinutes: minutes,
                data: heatmap
            };
        }
    }

    /**
     * Mock function to simulate a Snowflake insert delay
     */
    static async mockSnowflakeInsert(record) {
        return new Promise(resolve => setTimeout(resolve, 50));
    }

    /**
     * Mock function to simulate a Snowflake heatmap query
     */
    static async mockSnowflakeQuery(cutoffTime) {
        return new Promise(resolve => setTimeout(() => {
            resolve({
                source: 'snowflake',
                data: {
                    'TOKEN_REUSE': { count: 12, avgRisk: 95 },
                    'VOICE_VERIFICATION_FAILED': { count: 5, avgRisk: 85 }
                }
            });
        }, 100));
    }
}

module.exports = FraudService;
