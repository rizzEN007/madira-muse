import axios from 'axios';

const BASE = 'http://localhost:5000/api';

export const getStaff         = ()                        => axios.get(`${BASE}/staff`);
export const addStaff         = (data)                    => axios.post(`${BASE}/staff`, data);
export const updateStaff      = (id, data)                => axios.put(`${BASE}/staff/${id}`, data);
export const deleteStaff      = (id)                      => axios.delete(`${BASE}/staff/${id}`);
export const markAttendance   = (data)                    => axios.post(`${BASE}/staff/attendance`, data);
export const getAttendance    = (month, year)             => axios.get(`${BASE}/staff/attendance`, { params: { month, year } });
export const getSalaryReport  = (month, year)             => axios.get(`${BASE}/staff/salary`, { params: { month, year } });