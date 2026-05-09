const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const triggerRevocationWebhook = async (payload) => {
    try {
        const webhookUrl = process.env.N8N_WEBHOOK_URL;
        
        if (!webhookUrl || webhookUrl.trim() === '') {
            console.warn("⚠️ [n8n SIMULATION] N8N_WEBHOOK_URL is not set in .env. Skipping real webhook trigger. Mocking n8n success.");
            return true;
        }
        
        // Fire webhook to n8n
        const response = await axios.post(webhookUrl, payload);
        console.log("✅ [n8n] Revocation webhook triggered successfully:", response.status);
        return true;
    } catch (error) {
        console.error("❌ [n8n] Failed to trigger revocation webhook:", error.message);
        // We return false but avoid throwing so the main revocation flow doesn't crash if n8n is down
        return false;
    }
};

module.exports = { triggerRevocationWebhook };
