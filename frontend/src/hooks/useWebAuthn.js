import { useState } from 'react';

export function useWebAuthn() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('Bind your device for biometric verification.');

  const bindDevice = async () => {
    if (!window.PublicKeyCredential) {
      setStatus('error');
      setMessage('WebAuthn is not supported in this browser.');
      return { success: false, error: 'WebAuthn is not supported in this browser.' };
    }

    setStatus('pending');
    setMessage('Waiting for biometric confirmation...');

    try {
      const publicKey = {
        challenge: Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(32))),
        rp: { name: 'PrivaKYC', id: window.location.hostname },
        user: {
          id: Uint8Array.from(window.crypto.getRandomValues(new Uint8Array(16))),
          name: 'user@example.com',
          displayName: 'PrivaKYC User',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' },   // ES256 (ECDSA with P-256)
          { alg: -257, type: 'public-key' }  // RS256 (RSASSA-PKCS1-v1_5 with SHA-256)
        ],
        timeout: 90000,
        attestation: 'direct',
      };

      await navigator.credentials.create({ publicKey });
      setStatus('success');
      setMessage('Biometric binding complete — device registered securely.');
      return { success: true };
    } catch (error) {
      setStatus('error');
      setMessage('Biometric binding failed. Please try again with a compatible device.');
      return { success: false, error: error?.message || 'Biometric binding failed.' };
    }
  };

  return { status, message, bindDevice };
}
