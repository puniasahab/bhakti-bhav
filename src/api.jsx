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
  },
  getBanners: async () => {
    try {
      const response = await api.get(endPoints.banner);
      return response.data;
    }
    catch(error) {
      console.error("Error fetching banners:", error);
      throw error;
    }
  },

  getWallpaperCategories: async () => {
    try {
      const response = await api.get(endPoints.wallpaperCategories);
      return response.data;
    } catch (error) {
      console.error("Error fetching wallpaper categories:", error);
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
  generateOtp: async (mobileNumber, deviceId) => {
    try {
      console.log("Generating OTP for data:", mobileNumber, deviceId);
      const response = await api.post(endPoints.generateOtp, { mobileNumber, source: "web", deviceId });
      return response.data;
    } catch (error) {
      console.error("Error generating OTP:", error);
      throw error;
    }
  },

  verifyOtp: async (data) => {
    console.log("Verifying OTP with data:", data);
    const { mobile, otp } = data;
    try {

      debugger;
      const response = await api.post(endPoints.verifyOtp, {mobileNumber: mobile, otp: otp, source: "web"});
      return response.data;
    } catch (error) {
      console.error("Error verifying OTP:", error);
      throw error;
    }
  }
}


export const pujaKareApis = {
  getPujaKareItems: async (curentPage, limit) => {
    try {
      const response = await api.get(`${endPoints.pujaKarein}?activeOnly=true&page=${curentPage}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Puja Kare items:", error);
      throw error;
    }
  },
  
  getPujaKareDetailsFromId: async (id) => {
    try {
      const response = await api.get(`${endPoints.pujaKarein}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching Puja Kare item with ID ${id}:`, error);
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
      // Create a custom config for FormData requests
      const config = {};
      
      // If data is FormData, don't set Content-Type header - let browser set it
      if (data instanceof FormData) {
        config.headers = {
          'Content-Type': 'multipart/form-data'
        };
      }
      
      const response = await api.put(endPoints.updateProfile, data, config);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }
}


export const blogApis = {
  getBlogs: async () => {
    try {
      // Route through /drupal-api proxy to avoid CORS (see src/setupProxy.js)
      const response = await axios.get(
        "/drupal-api/jsonapi/node/blog?filter[field_portal.id][value]=7d43c493-6d43-4e6d-a7fd-052ac5fff8d2&page[limit]=10&page[offset]=0&include=field_blog_image,field_category,field_portal",
        {
          headers: {
            Accept: "application/vnd.api+json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching blogs:", error);
      throw error;
    }
  },
};

export const contactUsApis = {
  submitContactForm: async (data) => {
    try {
      // const response = await api.post(endPoints.contactUs, data);
      const response = await fetch("https://api.bhaktibhav.app/frontend/contact-us", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      return response.data;
    } catch (error) {
      console.error("Error submitting contact form:", error);
      throw error;
    }
  }
};

export default api;
