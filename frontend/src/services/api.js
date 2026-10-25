import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const getSchemes = async () => {
  const response = await axios.get(`${API_BASE_URL}/schemes`);
  return response.data;
};

export const getSchemeById = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/schemes`);
  const schemes = response.data;
  return schemes.find(s => s.id === parseInt(id) || s.id === id);
};

export const getDashboardStats = async () => {
  const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
  return response.data;
};

export const assessEligibility = async (payload) => {
  const response = await axios.post(`${API_BASE_URL}/eligibility/assess`, payload);
  return response.data;
};