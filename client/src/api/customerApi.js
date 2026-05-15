import axios from 'axios';

const BASE = 'http://localhost:5000/api/customers';

export const getCustomers           = ()           => axios.get(BASE);
export const createCustomer         = (data)       => axios.post(BASE, data);
export const updateCustomer         = (id, data)   => axios.put(`${BASE}/${id}`, data);
export const deleteCustomer         = (id)         => axios.delete(`${BASE}/${id}`);
export const getCustomerTransactions= (id)         => axios.get(`${BASE}/${id}/transactions`);
export const addCustomerTransaction = (id, data)   => axios.post(`${BASE}/${id}/transactions`, data);