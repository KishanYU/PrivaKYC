import { useEffect, useRef, useState } from 'react';
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';

const uint8ArrayToBase64 = (bytes) => {
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return window.btoa(binary);
};

export function useParaWallet() {
  const walletRef = useRef(null);
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('Connect Para wallet to sign transactions and proofs.');
  const [providerDetected, setProviderDetected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const peraWallet = new PeraWalletConnect({ chainId: 416002, shouldShowSignTxnToast: false });
    walletRef.current = peraWallet;
    setProviderDetected(true);
    setMessage('Para Wallet Connect is available. Connect to continue.');

    const reconnectSession = async () => {
      try {
        const accounts = await peraWallet.reconnectSession();
        if (Array.isArray(accounts) && accounts.length > 0) {
          const account = accounts[0];
          if (algosdk.isValidAddress(account)) {
            setAddress(account);
            setStatus('success');
            setMessage('Para wallet session restored.');
          }
        }
      } catch {
        // ignore session reconnect failures
      }

      peraWallet.connector?.on('disconnect', () => {
        setAddress('');
        setStatus('idle');
        setMessage('Para wallet disconnected.');
      });
    };

    reconnectSession();
  }, []);

  const connectWallet = async () => {
    if (!walletRef.current) {
      setStatus('error');
      setMessage('Para wallet connector is not initialized.');
      return;
    }

    setStatus('pending');
    setMessage('Waiting for Para wallet approval...');

    try {
      const accounts = await walletRef.current.connect();
      const account = Array.isArray(accounts) ? accounts[0] : accounts;

      if (!account) {
        throw new Error('No address returned from Para wallet.');
      }

      if (!algosdk.isValidAddress(account)) {
        throw new Error('Invalid Algorand address returned by wallet.');
      }

      setAddress(account);
      setStatus('success');
      setMessage('Para wallet connected successfully.');
      setProviderDetected(true);
    } catch (error) {
      const errorMessage = error?.message || 'Unable to connect Para wallet.';
      setStatus('error');
      setMessage(errorMessage);
    }
  };

  const signTransaction = async (unsignedTxn) => {
    if (!walletRef.current) {
      throw new Error('Para wallet connector is not initialized.');
    }

    if (!address) {
      throw new Error('Para wallet is not connected.');
    }

    try {
      const signedGroups = await walletRef.current.signTransaction([[unsignedTxn]], address);
      const signedTxnBytes = Array.isArray(signedGroups) && signedGroups[0] ? signedGroups[0] : null;

      if (!signedTxnBytes) {
        throw new Error('Para wallet returned no signed transaction.');
      }

      return uint8ArrayToBase64(signedTxnBytes);
    } catch (error) {
      throw error;
    }
  };

  const disconnectWallet = async () => {
    if (walletRef.current) {
      try {
        await walletRef.current.disconnect();
      } catch {
        // ignore disconnect failures
      }
    }

    setAddress('');
    setStatus('idle');
    setMessage('Para wallet disconnected.');
  };

  return {
    address,
    status,
    message,
    providerDetected,
    connectWallet,
    disconnectWallet,
    signTransaction,
  };
}
