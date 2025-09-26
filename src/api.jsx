import axios from 'axios';

const BASEURL = process.env.VITE_BASE_PUBLIC_URL || 'http://localhost:3000/api';
const api = axios.create({
  baseURL: BASEURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

import { getTokenFromLS } from './commonFunctions';

api.interceptors.request.use(
  (config) => {
    const token = getTokenFromLS();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);  


export const mantraApis = {
  getMantra: async () => {
    try {
      const response = await api.get("/mantras");
      return response.data;
    } catch (error) {
      console.error("Error fetching mantras:", error);
      throw error;
    }
  }
}