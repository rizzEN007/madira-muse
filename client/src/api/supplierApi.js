import axios from 'axios';

const BASE = 'http://localhost:5000/api/suppliers';

export const getSuppliers           = ()           => axios.get(BASE);
export const createSupplier         = (data)       => axios.post(BASE, data);
export const updateSupplier         = (id, data)   => axios.put(`${BASE}/${id}`, data);
export const deleteSupplier         = (id)         => axios.delete(`${BASE}/${id}`);
export const getSupplierTransactions= (id)         => axios.get(`${BASE}/${id}/transactions`);
export const addSupplierTransaction = (id, data)   => axios.post(`${BASE}/${id}/transactions`, data);