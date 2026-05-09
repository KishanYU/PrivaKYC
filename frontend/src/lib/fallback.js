const REVOCATION_REGISTRY_KEY = 'privakyc_revocation_registry';
const TOKENS_STORAGE_KEY = 'privakyc_sandbox_tokens';
const AUDIT_LOGS_KEY = 'privakyc_sandbox_audit_logs';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const loadLocalStorage = (key, fallback) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveLocalStorage = (key, value) => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage failures in sandbox mode
  }
};

const loadRegistry = () => loadLocalStorage(REVOCATION_REGISTRY_KEY, {});
const saveRegistry = (registry) => saveLocalStorage(REVOCATION_REGISTRY_KEY, registry);
const loadTokens = () => loadLocalStorage(TOKENS_STORAGE_KEY, []);
const saveTokens = (tokens) => saveLocalStorage(TOKENS_STORAGE_KEY, tokens);
const loadAuditLogs = () => loadLocalStorage(AUDIT_LOGS_KEY, []);
const saveAuditLogs = (logs) => saveLocalStorage(AUDIT_LOGS_KEY, logs);

const generateRecoveryPhrase = () => {
  const words = [
    'anchor', 'beam', 'civic', 'delta', 'echo', 'forge', 'glow', 'haven', 'iris', 'jade',
    'krypt', 'lumen', 'nova', 'opal', 'phoenix', 'quartz', 'rally', 'solace', 'tango', 'unity',
    'vapor', 'woven', 'xenon', 'yonder', 'zephyr',
  ];
  return Array.from({ length: 15 }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
};

const appendAuditLog = (tokenId, event, details = {}) => {
  const logs = loadAuditLogs();
  const enriched = [
    {
      tokenId,
      event,
      details,
      createdAt: new Date().toISOString(),
      status: event.includes('REVOKE') ? 'REJECTED_REVOKED' : 'SUCCESS',
    },
    ...logs,
  ];

  saveAuditLogs(enriched);
  return enriched;
};

export const mockUploadAadhaarXml = async (formData) => {
  await delay(300);

  const file = formData.get('aadhaarXml');
  let xml = '';

  if (file && typeof file.text === 'function') {
    xml = await file.text();
  }

  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(xml, 'application/xml');
    const poi = document.querySelector('Poi');
    const poa = document.querySelector('Poa');

    return {
      success: true,
      provider: 'mock',
      name: poi?.getAttribute('name') || 'Demo User',
      dob: poi?.getAttribute('dob') || '1990-01-01',
      gender: poi?.getAttribute('gender') || 'M',
      state: poa?.getAttribute('state') || 'Karnataka',
    };
  } catch {
    return {
      success: true,
      provider: 'mock',
      name: 'Demo User',
      dob: '1990-01-01',
      gender: 'M',
      state: 'Karnataka',
    };
  }
};

export const mockCreateProof = async (payload) => {
  await delay(500);
  const tokenId = `TK-SB-${Date.now().toString(36).toUpperCase()}`;

  return {
    success: true,
    tokenId,
    proof: {
      tokenId,
      simulated: true,
      claims: payload?.selectedClaims || {},
      dob: payload?.dob || '1990-01-01',
    },
    publicSignals: ['1'],
  };
};

export const mockRegisterToken = async (payload) => {
  await delay(500);
  const existingTokens = loadTokens();
  const txId = `TX-SB-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const mnemonic = generateRecoveryPhrase();
  const now = new Date().toISOString();

  const token = {
    tokenId: payload.tokenId,
    proof: payload.proof || null,
    status: 'ACTIVE',
    registerTxId: txId,
    createdAt: now,
    revokedAt: null,
    revokeTxId: null,
    proofHash: null,
    recoveryPhrase: mnemonic,
  };

  const updatedTokens = [token, ...existingTokens.filter((t) => t.tokenId !== token.tokenId)];
  saveTokens(updatedTokens);
  appendAuditLog(token.tokenId, 'TOKEN_REGISTERED', { txId });

  return {
    success: true,
    txId,
    mnemonic,
    status: 'ACTIVE',
    storedData: {
      tokenId: token.tokenId,
      proofHash: token.proofHash,
      note: 'Sandbox registration only stores the demo token metadata locally.',
    },
  };
};

export const mockRevokeToken = async (tokenId, reason = 'user_request') => {
  await delay(300);
  const tokens = loadTokens();
  const token = tokens.find((t) => t.tokenId === tokenId);

  if (!token) {
    throw new Error('Token not found in sandbox mode.');
  }

  if (token.status === 'REVOKED') {
    throw new Error('Token is already revoked in sandbox mode.');
  }

  const txId = `REVOKE_SBX_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const updatedTokens = tokens.map((t) =>
    t.tokenId === tokenId
      ? { ...t, status: 'REVOKED', revokeTxId: txId, revokedAt: new Date().toISOString(), revocationReason: reason }
      : t
  );

  saveTokens(updatedTokens);
  appendAuditLog(tokenId, 'TOKEN_REVOKED', { txId, reason });

  return {
    success: true,
    txId,
    status: 'REVOKED',
    tokenId,
  };
};

export const mockBuildRegisterTxn = async (payload) => {
  await delay(200);
  return {
    success: true,
    txId: `BUILD_SBX_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    unsignedTxn: btoa(JSON.stringify({ action: 'REGISTER', tokenId: payload.tokenId, sender: payload.sender })),
  };
};

export const mockBuildRevokeTxn = async (payload) => {
  await delay(200);
  return {
    success: true,
    txId: `BUILD_REVOKE_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    unsignedTxn: btoa(JSON.stringify({ action: 'REVOKE', tokenId: payload.tokenId, sender: payload.sender })),
  };
};

export const mockSubmitRegisterTxn = async (payload) => {
  await delay(300);
  return mockRegisterToken({
    tokenId: payload.tokenId,
    proof: payload.proof,
  });
};

export const mockSubmitRevokeTxn = async (payload) => {
  await delay(300);
  return mockRevokeToken(payload.tokenId, payload.reason || 'user_request');
};

export const mockGetActiveTokens = async () => {
  await delay(300);
  return { tokens: loadTokens() };
};

export const mockVerifyProof = async (proof) => {
  await delay(200);
  return {
    verified: Boolean(proof),
    revoked: false,
    bankStorage: {
      tokenId: proof?.tokenId || 'TK-SB-UNKNOWN',
      note: 'Sandbox proof verification does not perform real ZK math.',
    },
    message: proof ? 'Sandbox proof verified successfully.' : 'Proof is invalid or empty.',
  };
};

export const mockGetRevocationStatus = async (tokenId) => {
  await delay(200);
  const token = loadTokens().find((t) => t.tokenId === tokenId);

  return {
    tokenId,
    status: token?.status || 'UNKNOWN',
    revokedAt: token?.revokedAt || null,
    message: token ? 'Sandbox revocation status retrieved.' : 'Token not found in sandbox registry.',
  };
};

export const mockGetAccessLogs = async (tokenId) => {
  await delay(250);

  return {
    logs: loadAuditLogs().filter((log) => !tokenId || log.tokenId === tokenId),
  };
};

export const mockEmergencyRevokeToken = async (mnemonic) => {
  await delay(400);

  const tokens = loadTokens();
  const normalized = mnemonic.trim();
  const token = tokens.find((t) => t.recoveryPhrase?.trim() === normalized);

  if (!token) {
    throw new Error('Invalid recovery phrase. Sandbox identity not found.');
  }

  if (token.status === 'REVOKED') {
    throw new Error('Identity is already revoked in sandbox mode.');
  }

  const txId = `EMERGENCY_REVOKE_SBX_${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  const updatedTokens = tokens.map((t) =>
    t.tokenId === token.tokenId
      ? { ...t, status: 'REVOKED', revokeTxId: txId, revokedAt: new Date().toISOString(), revocationReason: 'Emergency recovery phrase' }
      : t
  );

  saveTokens(updatedTokens);
  appendAuditLog(token.tokenId, 'EMERGENCY_TOKEN_REVOKED', { txId });

  return {
    success: true,
    revokeTxId: txId,
    tokenId: token.tokenId,
  };
};

export const mockDigiLockerAuthUrl = async () => ({
  success: true,
  demoMode: true,
  authUrl: null,
  message: 'Local demo mode enabled. Use the Resume DigiLocker session button to continue the flow.',
});

export const mockProcessDigiLockerCallback = async () => {
  await delay(300);

  return {
    success: true,
    accessToken: 'sandbox-access-token',
    provider: 'mock',
    extractedData: {
      name: 'Demo User',
      dob: '1990-01-01',
      gender: 'M',
      state: 'Karnataka',
    },
  };
};

export const safeParseJson = (value, fallback) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const formatTokenId = (id) => {
  if (typeof id !== 'string' || id.length <= 12) return id;
  return `${id.slice(0, 6)}...${id.slice(-4)}`;
};

export const formatDateTime = (iso) => {
  const date = new Date(iso);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
