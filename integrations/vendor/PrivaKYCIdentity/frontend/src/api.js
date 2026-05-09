import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const initiateKyc = async (aadhaarNumber) => {
  const response = await api.post('/kyc/initiate', { aadhaarNumber });
  return response.data;
};

export const verifyKyc = async (transactionId, otp) => {
  const response = await api.post('/kyc/verify', { transactionId, otp });
  return response.data;
};

export const authenticateDigilocker = async () => {
  const response = await api.post('/kyc/digilocker-auth');
  return response.data;
};

export default api;
