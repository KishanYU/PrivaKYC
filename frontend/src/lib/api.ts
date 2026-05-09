import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStatus = async () => {
  const response = await api.get('/status');
  return response.data;
};

export const uploadAadhaarXml = async (formData: FormData) => {
  const response = await api.post('/aadhaar/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const createProof = async (payload: Record<string, any>) => {
  const response = await api.post('/proof/generate', payload);
  return response.data;
};

export const verifyProof = async (proof: string) => {
  const response = await api.post('/proof/verify', { proof });
  return response.data;
};

export const getActiveTokens = async () => {
  const response = await api.get('/tokens');
  return response.data;
};

export const revokeToken = async (tokenId: string) => {
  const response = await api.post('/tokens/revoke', { tokenId });
  return response.data;
};

export default api;
