import axios from 'axios';

const BASE = 'http://localhost:5000/api/expenses';

export const getExpenses    = (from, to) => axios.get(BASE, { params: { from, to } });
export const createExpense  = (data)     => axios.post(BASE, data);
export const updateExpense  = (id, data) => axios.put(`${BASE}/${id}`, data);
export const deleteExpense  = (id)       => axios.delete(`${BASE}/${id}`);