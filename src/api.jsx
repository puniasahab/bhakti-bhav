import axios from 'axios';
import { getTokenFromLS } from './commonFunctions';
import { endPoints } from './endpoints';

const BASEURL = process.env.REACT_APP_API_BASE_URL || 'https://api.bhaktibhav.app/frontend/';
console.log("API Base URL:", BASEURL);
const api = axios.create({
  baseURL: BASEURL,
  headers: {
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = getTokenFromLS();
    console.log("TOKEN", token);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const wallpaperApis = {
  downloadWallpaper: async (id) => {
    try {
      const response = await api.get(`${endPoints.downloadWallpaper}/${id}`);
      return response.data;
    }
    catch(error) {
      console.error("Error downloading wallpaper:", error);
      throw error;
    }
  }
}
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



// [Nest] 26128  - 01/10/2025, 10:30:22 am     LOG [RouterExplorer] Mapped
//  {/subscription-plans, POST} route +0ms
// [Nest] 26128  - 01/10/2025, 10:30:22 am     LOG [RouterExplorer] Mapped 
// {/subscription-plans, GET} route +0ms
// [Nest] 26128  - 01/10/2025, 10:30:22 am     LOG [RouterExplorer] Mapped
//  {/subscription-plans/:id, GET} route +0ms
// [Nest] 26128  - 01/10/2025, 10:30:22 am     LOG [RouterExplorer] 
// Mapped {/subscription-plans/:id, PUT} route +1ms
// [Nest] 26128  - 01/10/2025, 10:30:22 am     LOG [RouterExplorer] 
// Mapped {/subscription-plans/:id, DELETE} route
// http://localhost:3007/frontend/generate-otp
// http://localhost:3007/frontend/verify-otp


export const subscriptionApis = {
   getSubscriptionPlans: async () => {
    try {
      const response = await api.get(endPoints.getSubscriptionPlans);
      return response.data;
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      throw error;
    }
  },

  getPlanById: async (id) => {
    try {
      const response = await api.get(`${endPoints.getSubscriptionPlansById}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching subscription plan with ID ${id}:`, error);
      throw error;
    }
  }
}

export const paymentApis = {
  makePayment: async (data) => {
    try {
      const response = await api.post(endPoints.makePayment, data);
      return response.data;
    } catch (error) {
      console.error("Error making payment:", error);
      throw error;
    }
  },

  verifyPayments: async (data) => {
    try {
      const response = await api.post(endPoints.verifyPayment, data);
      return response.data;

    }
    catch(error) {
      console.log("Error Verifying payment:", error);
      throw error;
    }
  },

  getTransactions: async () => {
    try {
      const response = await api.get(endPoints.getTransactions);
      return response.data;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    } 
  }
}
export const loginApis = {
  generateOtp: async (data) => {
    try {
      const response = await api.post(endPoints.generateOtp, { mobile: data });
      return response.data;
    } catch (error) {
      console.error("Error generating OTP:", error);
      throw error;
    }
  },

  verifyOtp: async (data) => {
    try {
      const response = await api.post(endPoints.verifyOtp, data);
      return response.data;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  }
}


export const profileApis = {
  getProfile: async () => {
    try {
      const response = await api.get(endPoints.getProfile);
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },
  updateProfile: async (data) => {
    try {
      const response = await api.put(endPoints.updateProfile, data);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }
}

export default api;
