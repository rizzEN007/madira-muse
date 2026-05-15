import axios from 'axios';

const BASE = 'http://localhost:5000/api';

export const getProducts    = ()          => axios.get(`${BASE}/products`);
export const createProduct  = (data)      => axios.post(`${BASE}/products`, data);
export const updateProduct  = (id, data)  => axios.put(`${BASE}/products/${id}`, data);
export const deleteProduct  = (id)        => axios.delete(`${BASE}/products/${id}`);