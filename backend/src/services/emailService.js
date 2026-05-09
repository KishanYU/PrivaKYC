const nodemailer = require('nodemailer');

const createTransporter = async () => {
    // If no real SMTP credentials are provided in .env, use a test Ethereal account
    // This ensures the demo never fails even without real credentials
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('[EmailService] Using Ethereal Email for demo purposes.');
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    // Real SMTP Configuration (e.g., Gmail)
    return nodemailer.createTransport({
        service: process.env.SMTP_SERVICE || 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

const sendBankNotification = async (subject, htmlContent) => {
    try {
        const transporter = await createTransporter();
        const bankEmail = process.env.BANK_EMAIL || 'pavu586@gmail.com';
        
        const info = await transporter.sendMail({
            from: `"PrivaKYC Bank Oracle" <${process.env.SMTP_USER || 'oracle@privakyc.com'}>`,
            to: bankEmail,
            subject: subject,
            html: htmlContent,
        });

        console.log(`[EmailService] Bank Notification sent to ${bankEmail}. Message ID: ${info.messageId}`);
        
        // If using Ethereal, log the preview URL for the judges
        if (info.messageId && info.messageId.includes('ethereal')) {
            console.log(`[EmailService] 👁️ Preview Demo Email: ${nodemailer.getTestMessageUrl(info)}`);
        }
        return true;
    } catch (error) {
        console.error(`[EmailService] Error sending email:`, error.message);
        return false;
    }
};

const sendRevocationAlert = async (tokenId, txId, reason = "User Initiated Revocation") => {
    const subject = `🚨 URGENT: Identity Revoked for Token ${tokenId.substring(0, 8)}...`;
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #eab308; border-radius: 8px;">
            <h2 style="color: #dc2626;">🚨 PRIVAKYC ALERT: IDENTITY REVOKED</h2>
            <p><strong>Bank/Verifier Attention Required</strong></p>
            <p>The following zero-knowledge identity token has been revoked on the Algorand blockchain and is no longer valid for transactions.</p>
            <ul>
                <li><strong>Token ID:</strong> ${tokenId}</li>
                <li><strong>Transaction ID:</strong> ${txId}</li>
                <li><strong>Reason:</strong> ${reason}</li>
                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This is an automated message from the PrivaKYC Oracle. Please update your local ledgers immediately.</p>
        </div>
    `;
    return sendBankNotification(subject, html);
};

const sendFraudAlert = async (alertType, riskScore, details = {}) => {
    const subject = `⚠️ HIGH RISK: Fraud Alert Detected (${alertType})`;
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #dc2626; border-radius: 8px;">
            <h2 style="color: #dc2626;">⚠️ PRIVAKYC FRAUD ALERT</h2>
            <p><strong>Sponsor Layer Risk Engine Detection</strong></p>
            <p>A high-risk activity has been detected. Please review immediately.</p>
            <ul>
                <li><strong>Alert Type:</strong> ${alertType}</li>
                <li><strong>Risk Score:</strong> ${riskScore}/100</li>
                <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
                <li><strong>Additional Details:</strong> ${JSON.stringify(details)}</li>
            </ul>
            <p style="margin-top: 20px; font-size: 12px; color: #666;">This is an automated message from the PrivaKYC Fraud Intelligence Service.</p>
        </div>
    `;
    return sendBankNotification(subject, html);
};

module.exports = {
    sendRevocationAlert,
    sendFraudAlert
};
