# Frontend Integration Guide: Auditor Access Logs (Data Provenance)

Users need to trust that their data is safe. A major feature of PrivaKYC is that the user can see exactly **who** tried to verify their ZK Proof, **when** they did it, and whether the bank was **successful or rejected** (because of revocation or bad math).

Here is how you display the "Recent Activity" or "Access Log" on the user's Dashboard.

---

## Fetching the Logs

When the user is logged into their Dashboard and looking at their active KYC Token, use their `tokenId` to fetch their logs from the backend.

```javascript
// Fetch the access logs for the specific token created in /api/zk/generate-proof
async function fetchAccessLogs(tokenId) {
    try {
        const response = await fetch(`http://localhost:3000/api/compliance/logs/${tokenId}`);
        const data = await response.json();
        
        if (data.success) {
            console.log(`Total Checks: ${data.totalChecks}`);
            renderLogsTable(data.logs);
        }
    } catch (error) {
        console.error("Failed to fetch logs", error);
    }
}
```

## The Response Structure

The API will return an array of logs sorted by newest first:

```json
{
  "success": true,
  "totalChecks": 2,
  "logs": [
    {
      "_id": "645b23xyz...",
      "tokenId": "5dbf42ac-438f-4f56-9696-f6b6535a6a6a",
      "verifierName": "HDFC Bank (Demo)",
      "status": "REJECTED_REVOKED",
      "ipAddress": "::1",
      "timestamp": "2026-05-08T18:05:00.000Z"
    },
    {
      "_id": "645b21xyz...",
      "tokenId": "5dbf42ac-438f-4f56-9696-f6b6535a6a6a",
      "verifierName": "HDFC Bank (Demo)",
      "status": "SUCCESS",
      "ipAddress": "::1",
      "timestamp": "2026-05-08T18:00:00.000Z"
    }
  ]
}
```

## UI Suggestions for the Frontend Team
1. **Show a timeline/table:** Put this in a cool "Auditor Logs" table.
2. **Color Code the Status:**
   - `SUCCESS`: 🟢 Green (Bank successfully verified you).
   - `REJECTED_REVOKED`: 🔴 Red (Bank tried to access, but you had mathematically locked them out via Algorand!).
   - `FAILED_SIGNATURE`: 🟠 Orange (Someone tried to forge your ZK proof hash).
   
This is a huge selling point for VC Pitches ("Total Transparency for the Consumer"). Make it look like a highly secure data vault log!
