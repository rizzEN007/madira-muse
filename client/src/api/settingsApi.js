import axios from 'axios';
const BASE = 'http://localhost:5000/api';

export const getSetting  = (key)       => axios.get(`${BASE}/settings/${key}`);
export const setSetting  = (key, value) => axios.post(`${BASE}/settings`, { key, value });
export const verifyPin   = (pin)       => axios.post(`${BASE}/settings/verify-pin`, { pin });