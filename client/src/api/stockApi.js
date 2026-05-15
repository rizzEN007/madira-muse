import axios from 'axios';

const BASE = 'http://localhost:5000/api';

export const getMovements  = (productId) =>
  axios.get(`${BASE}/stock`, { params: productId ? { productId } : {} });

export const addMovement = (data) => axios.post(`${BASE}/stock`, data);