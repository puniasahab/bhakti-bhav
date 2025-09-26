import axios from 'axios';
import { getTokenFromLS } from './commonFunctions';
import { endPoints } from './endpoints';

const BASEURL = process.env.API_BASE_PUBLIC_URL;
const api = axios.create({
  baseURL: BASEURL,
  headers: {
    'Content-Type': 'application/json',
  },
});


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
  getAllMantras: async () => {
    try {
      const response = await api.get(endPoints.getAllMantras);
      return response.data;
    } catch (error) {
      console.error("Error fetching mantras:", error);
      throw error;
    }
  },

  getMantraById: async (id) => {
    try {
      const response = await api.get(`${endPoints.getMantraById}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching mantra with ID ${id}:`, error);
      throw error;
    }
  }
}


export const hinduCalendarApis = {
  getPanchangCalendar: async () => {
    try {
      const response = await api.get('frontend/panchang-calendar');
      return response.data;
    } catch (error) {
      console.error("Error fetching Panchang Calendar:", error);
      throw error;
    }
  }
}

export default api;
