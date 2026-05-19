import axios from 'axios';
const BASE = 'http://localhost:5000/api';

export const getSalesHistory = (params) => axios.get(`${BASE}/sales-history`, { params });
export const getClosingBalance = (type, date) => axios.get(`${BASE}/sales-history/closing`, { params: { type, date } });
export const getSaleDetail = (id) => axios.get(`${BASE}/sales-history/${id}`);