import axios from 'axios';

const BASE = 'http://localhost:5000/api';

export const completeSale = (data) => axios.post(`${BASE}/sales`, data);
export const getSales      = ()     => axios.get(`${BASE}/sales`);
export const getSale       = (id)   => axios.get(`${BASE}/sales/${id}`);