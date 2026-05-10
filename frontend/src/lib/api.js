import axios from 'axios';
import {
  mockUploadAadhaarXml,
  mockCreateProof,
  mockRegisterToken,
  mockBuildRegisterTxn,
  mockBuildRevokeTxn,
  mockGetActiveTokens,
  mockGetAccessLogs,
  mockRevokeToken,
  mockSubmitRegisterTxn,
  mockSubmitRevokeTxn,
  mockVerifyProof,
  mockGetRevocationStatus,
  mockDigiLockerAuthUrl,
  mockProcessDigiLockerCallback,
  mockEmergencyRevokeToken,
} from './fallback';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://privakyc.onrender.com/api',
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://privakyc.onrender.com/api';
const hasBackend = Boolean(apiBaseUrl);
const n8nRevokeWebhook = import.meta.env.VITE_N8N_REVOKE_WEBHOOK || null;

const triggerN8nRevokeWebhook = async (payload) => {
  if (!n8nRevokeWebhook) {
    return null;
  }

  try {
    return await axios.post(n8nRevokeWebhook, payload, {
      timeout: 8000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.warn('n8n revoke webhook failed:', error?.message || error);
    return null;
  }
};

export const getStatus = async () => {
  if (!hasBackend) {
    return { status: 'sandbox', message: 'Running in local verification mode' };
  }

  const response = await api.get('/compliance');
  return response.data;
};

export const uploadAadhaarXml = async (formData) => {
  if (!hasBackend) {
    return mockUploadAadhaarXml(formData);
  }

  const response = await api.post('/upload-xml', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createProof = async (payload) => {
  if (!hasBackend) {
    return mockCreateProof(payload);
  }

  const response = await api.post('/zk/generate-proof', payload);
  return response.data;
};

export const getDigiLockerAuthUrl = async () => {
  if (!hasBackend) {
    return mockDigiLockerAuthUrl();
  }

  const response = await api.get('/digilocker/auth');
  return response.data;
};

export const processDigiLockerCallback = async (code = 'hackathon_auth_code_999') => {
  if (!hasBackend) {
    return mockProcessDigiLockerCallback(code);
  }

  const response = await api.get(`/digilocker/verify-code?code=${encodeURIComponent(code)}`);
  return response.data;
};

export const generateZkProof = async (payload) => {
  const response = await api.post('/zk/generate-proof', payload);
  return response.data;
};

export const registerToken = async (payload) => {
  if (!hasBackend) {
    return mockRegisterToken(payload);
  }

  const response = await api.post('/algorand/register-token', payload);
  return response.data;
};

export const buildRegisterTxn = async (payload) => {
  if (!hasBackend) {
    return mockBuildRegisterTxn(payload);
  }

  const response = await api.post('/algorand/build-register-txn', payload);
  return response.data;
};

export const submitRegisterTxn = async (payload) => {
  if (!hasBackend) {
    return mockSubmitRegisterTxn(payload);
  }

  const response = await api.post('/algorand/submit-register-txn', payload);
  return response.data;
};

export const buildRevokeTxn = async (payload) => {
  if (!hasBackend) {
    return mockBuildRevokeTxn(payload);
  }

  const response = await api.post('/algorand/build-revoke-txn', payload);
  return response.data;
};

export const submitRevokeTxn = async (payload) => {
  if (!hasBackend) {
    return mockSubmitRevokeTxn(payload);
  }

  const response = await api.post('/algorand/submit-revoke-txn', payload);
  return response.data;
};

export const verifyProof = async (proofPayload) => {
  if (!hasBackend) {
    return mockVerifyProof(proofPayload.proof);
  }

  const response = await api.post('/verifier/verify', proofPayload);
  return response.data;
};

export const getActiveTokens = async () => {
  if (!hasBackend) {
    return mockGetActiveTokens();
  }

  const response = await api.get('/tokens');
  return response.data;
};

export const revokeToken = async (tokenId, reason = 'user_request', wallet = null, signedTxn = null) => {
  let result;

  if (!hasBackend) {
    result = await mockRevokeToken(tokenId, reason);
  } else {
    const response = await api.post('/algorand/revoke-token', { tokenId, signedTxn });
    result = response.data;
  }

  if (!hasBackend) {
    await triggerN8nRevokeWebhook({
      wallet,
      tokenId,
      reason,
      revokedAt: new Date().toISOString(),
      source: 'sandbox-revoke',
    });
  }

  return result;
};

export const emergencyRevokeToken = async (mnemonic, wallet = null) => {
  if (!hasBackend) {
    const result = await mockEmergencyRevokeToken(mnemonic);
    await triggerN8nRevokeWebhook({
      wallet,
      tokenId: result?.tokenId || null,
      reason: 'emergency_revoke',
      revokedAt: new Date().toISOString(),
      source: 'sandbox-emergency-revoke',
    });
    return result;
  }

  const response = await api.post('/algorand/emergency-revoke', { mnemonic });
  const result = response.data;
  // If backend exists, n8n is triggered by the backend
  if (!hasBackend) {
    await triggerN8nRevokeWebhook({
      wallet,
      tokenId: result?.tokenId || null,
      reason: 'emergency_revoke',
      revokedAt: new Date().toISOString(),
      source: 'sandbox-emergency-revoke',
    });
  }
  return result;
};

export const getRevocationStatus = async (tokenId) => {
  if (!hasBackend) {
    return mockGetRevocationStatus(tokenId);
  }

  const response = await api.get(`/tokens/${tokenId}/status`);
  return response.data;
};

export const getAccessLogs = async (tokenId) => {
  if (!hasBackend) {
    return mockGetAccessLogs(tokenId);
  }

  const response = await api.get(`/compliance/logs/${encodeURIComponent(tokenId)}`);
  return response.data;
};

export const verifyHighValueVoice = async ({ userId, expectedNumber, audioBase64 }) => {
  if (!hasBackend) {
    return {
      success: true,
      provider: 'mock',
      score: 0.99,
      message: 'Voice liveness check passed (sandbox mode).',
    };
  }

  const response = await api.post('/voice/verify', {
    userId,
    expectedNumber,
    audioBase64,
  });
  return response.data;
};

export default api;
