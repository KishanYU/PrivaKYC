import { useState } from 'react';

export function useWebAuthn() {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('Bind your device for biometric verification.');

  const bindDevice = async () => {
    if (!window.PublicKeyCredential) {
      setStatus('error');
      setMessage('WebAuthn is not supported in this browser.');
      return;
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
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
        timeout: 60000,
        attestation: 'direct' as const,
      };

      await navigator.credentials.create({ publicKey });
      setStatus('success');
      setMessage('Biometric binding complete — device registered securely.');
    } catch (error) {
      setStatus('error');
      setMessage('Biometric binding failed. Please try again with a compatible device.');
    }
  };

  return { status, message, bindDevice };
}
