import axios from 'axios';

const BASE = 'http://localhost:5000/api/dashboard';

export const getDashboardStats  = (from, to) => axios.get(`${BASE}/stats`,  { params: { from, to } });
export const getRecentSales     = (from, to) => axios.get(`${BASE}/recent`, { params: { from, to } });