import axios from 'axios';
import { getTokenFromLS } from './commonFunctions';
import { endPoints } from './endpoints';

const BASEURL = process.env.REACT_APP_API_BASE_URL || 'https://api.bhaktibhav.app/api/v1/frontend/';
const CORE_API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://stagingapi.bhaktibhav.app/api/v1/';
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
    catch (error) {
      console.error("Error downloading wallpaper:", error);
      throw error;
    }
  },
  getBanners: async () => {
    try {
      const response = await api.get(endPoints.banner);
      return response.data;
    }
    catch (error) {
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
// export const mantraApis = {
//   getAllMantras: async () => {
//     try {
//       const response = await api.get(endPoints.getAllMantras);
//       return response.data;
//     } catch (error) {
//       console.error("Error fetching mantras:", error);
//       throw error;
//     }
//   },

//   getMantraById: async (id) => {
//     try {
//       const response = await api.get(`${endPoints.getMantraById}/${id}`);
//       return response.data;
//     } catch (error) {
//       console.error(`Error fetching mantra with ID ${id}:`, error);
//       throw error;
//     }
//   }
// }


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
    catch (error) {
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
  generateOtp: async (mobileNumber, deviceId, userId) => {
    try {
      console.log("Generating OTP for data:", mobileNumber, deviceId);
      const response = await api.post(endPoints.generateOtp, { mobileNumber, source: "web", deviceId, userId });
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
      const response = await api.post(endPoints.verifyOtp, { mobileNumber: mobile, otp: otp, source: "web" });
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
      // https://drupal.df3.club/jsonapi/node/blog?filter[field_portal.id]=7d43c493-6d43-4e6d-a7fd-052ac5fff8d2&page[limit]=25
      const url = `https://drupal.df3.club/api/blogs?portal_uuid=${process.env.REACT_APP_DRUPAL_BHAKTI_BHAV_PORTAL_UUID}&category_uuid=${process.env.REACT_APP_DRUPAL_BHAKTI_BHAV_CATEGORY_UUID}&limit=25`;
      const response = await fetch(url, {
        headers: {
          "Accept": "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          "User-Agent": "Mozilla/5.0" // ✅ Helps bypass basic bot detection
        }
      });

      const data = await response.json();

      console.log("Consoling line response:", data);
      // Route through /drupal-api proxy to avoid CORS (see src/setupProxy.js)
      // const response = await axios.get(
      //   "/drupal-api/jsonapi/node/blog?filter[field_portal.id][value]=7d43c493-6d43-4e6d-a7fd-052ac5fff8d2&page[limit]=10&page[offset]=0&include=field_blog_image,field_category,field_portal",
      //   {
      //     headers: {
      //       Accept: "application/vnd.api+json",
      //     },
      //   }
      // );
      return data;
    } catch (error) {
      console.error("Error fetching blogs:", error);
      throw error;
    }
  },

  getBlogById: async (id) => {
    try {
      const url = `https://drupal.df3.club/api/blogs?blog_uuid=${id}`;
      const response = await fetch(url, {
        headers: {
          "Accept": "application/vnd.api+json",
          "Content-Type": "application/vnd.api+json",
          "User-Agent": "Mozilla/5.0" // ✅ Helps bypass basic bot detection
        }
      });

      const data = await response.json();
      console.log("Consoling line response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching blog by ID:", error);
      throw error;
    }
  }
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

const coreApi = axios.create({
  baseURL: BASEURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

coreApi.interceptors.request.use(
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

export const languageApis = {
  getLanguages: async () => {
    try {
      const response = await coreApi.get("https://api.bhaktibhav.app/api/v1/lang")
// g");
      return response.data;
    } catch (error) {
      console.error("Error fetching languages:", error);
      throw error;
    }
  }
};


export const homePageAPis = {
  fetchCategoriesList: async () => {
    try {
      const response = await api.get(endPoints.homeCategories);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching home page categories", error);
      throw error;
    }
  },

  fetchBannersData: async () => {
    try {
      const response = await api.get(endPoints.homeBanners);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching home page banners", error);
      throw error;
    }
  },

  fetchProfiledata: async () => {
    try {
      const response = await api.get(endPoints.getProfile);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching profile data for home page", error);
      throw error;
    }
  },

}

// vrat-katha-apis
export const vratKathaApis = {
  fetchVratKathaData: async () => {
    try {
      const response = await api.get(endPoints.vratKatha);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching Vrat Katha data", error);
      throw error;
    }
  },

  fetchSingleVratKathaData: async (id) => {
    try {
      const response = await api.get(`${endPoints.vratKatha}/${id}`);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching single Vrat Katha data", error);
      throw error;
    }
  },

  fetchVratKathaCategoryData: async (categoryId) => {
    try {
      const response = await api.get(`${endPoints.vratKatha}?category=${categoryId}`);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching Vrat Katha category data", error);
      throw error;
    }
  }
}


export const homeCategoryApis = {
  fetchHomeCategories: async (lang) => {
    try {
      console.log("Fetching home categories for language with api url: ", `${endPoints.featureCategory}?lang=${lang}`);
      const response = await coreApi.get(`${endPoints.featureCategory}?lang=${lang}`);
      return response.data;
    }
    catch(error) {
      console.error("Error fetching home categories", error);
      throw error;
    }
  }
}
// catgory-content-apis
export const categoryContentApis = {
  fetchCategoryContent: async (categoryId, contentType) => {
    console.log("Fetching category content for categoryId:", categoryId, contentType);
    try {
      const response = await api.get(`${endPoints.categoryContent}?category=${categoryId}&type=${contentType}`);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching category content", error);
      throw error;
    }
  },

  fetchContentDataByCategoryId: async (categoryId, lang, currentPage, limit) => {
    try {
      const response = await coreApi.get(`${endPoints.featureCategoryContent}?lang=${lang}&catgeoryId=${categoryId}&page=${currentPage}&limit=${limit}`);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching content data by ID", error);
      throw error;
    }
  },

  fetchContentDetailsByContentId: async (contentId, lang) => {
    try {
      const response = await coreApi.get(`${endPoints.content}/${contentId}?lang=${lang}`);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching content details by ID", error);
      throw error;
    }
  }
}

// rashifal-apis
export const rashifalApis = {
  getRashifal: async (date) => {
    try {
      const response = await api.get(`${endPoints.rashifal}?date=${date}`);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching Rashifal data", error);
      throw error;
    }
  }
};

export const hindiCalendarApis = {
  getHindiCalendarData: async (date) => {
    try {
      const response = await api.get(`${endPoints.hindiCalendar}?date=${date}`);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching Hindi Calendar data", error);
      throw error;
    }
  },

  getHindiCalendarDataForCurrentMonth: async () => {
    try {
      const response = await api.get(`${endPoints.hindiCalendar}?month=current`);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching Hindi Calendar data for current month", error);
      throw error;
    }
  },


};


// chalisa-apis
export const chalisaApis = {
  getChalisas: async (version, currentPage, limit, lang) => {
    try {
      const response = await api.get(`${endPoints.chalisa}?version-${version}&page=${currentPage}&limit=${limit}&lang=${lang}`);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching Chalisas", error);
      throw error;
    }
  },

  getChalisaById: async (version, id, lang) => {
    try {
      const response = await api.get(`${endPoints.getSingleChalisa}-version=${version}/id?lang=${lang}`);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching chalisa by ID", error);
      throw error;
    }
  }
};

// aarti-apis
export const aartiApis = {
  getAartis: async (version, currentPage, limit, lang) => {
    try {
      const response = await api.get(`${endPoints.aarti}-${version}?page=${currentPage}&limit=${limit}&lang=${lang}`);
      return response.data;
    }
    catch(error){
      console.error("Error fetching Aartis", error);
      throw error;
    }
  },

  getAartiById: async (version, id, lang) => {
    try {
      const response = await api.get(`${endPoints.aarti}-${version}/${id}?lang=${lang}`);
      return response.data;
    }
    catch(error){
      console.error("Error fetching Aarti by ID", error);
      throw error;  
    }
  }
}

// mantra-apis
export const mantraApis = {
  getMantras: async (version, currentPage, limit, lang) => {
    try {
      const response = await api.get(`${endPoints.mantras}-${version}?page=${currentPage}&limit=${limit}&lang=${lang}`);
      return response.data;
    }
    catch(error){
      console.error("Error fetching Mantras", error);
      throw error;
    }
  },

  getMantraById: async (version, id, lang) => {
    try {
      const response = await api.get(`${endPoints.getSingleMantra}-${version}/${id}?lang=${lang}`);
      return response.data;
    }
    catch(error){
      console.error("Error fetching Mantra by ID", error);
      throw error;
    }
  }
}

// pooja apis
export const poojaApis = {
  getPoojaList: async () => {
    try {
      const response = await api.get(endPoints.poojaList);
      return response.data;
    }
    catch(error){
      console.error("Error fetching Pooja list", error);
      throw error;
    }
  },

  getPoojaDetailsById: async (id) => {
    try {
      const response = await api.get(`${endPoints.poojaList}/${id}`);
      return response.data;
    }
    catch(error){
      console.error("Error fetching Pooja details by ID", error);
      throw error;
    }
  } 
}

export const splashScreenApi = {
  getSplashScreenData: async (version, data) => {
    try {
      const response = await coreApi.post(`https://api.bhaktibhav.app/api/v1/analytics/app-install/open-${version}`, data);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching Splash Screen data", error);
      throw error;
    }
  }
}

export const wallpaperDeepLinkingApi = {
  getWallpaperDeepLinkingData: async (lang) => {
    try {
      const response = await coreApi.get(`https://api.bhaktibhav.app/api/v1/wallpaper/wallpaper-deeplinking?lang=${lang}`);
      return response.data;
    }
    catch(error) {
      console.error("Error fetching wallpaper deep linking data", error);
      throw error;
    }
  }
};


export const newJaapMalaApis = {
  getJaapMalaCount: async (id, getCounterBoolean = true) => {
    try {
      const response = await api.get(`${endPoints.jaapMalaCount}/${id}?getCounter=${getCounterBoolean}`);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching Jaap Mala count", error);
      throw error;
    }
  },

  updateJaapMalaCount: async (id, count) => {
    try {
      const response = await api.post(`${endPoints.jaapMalaCount}/${id}/jaap`, {count});
      return response.data;
    }

    catch(error) {
      console.log("Error updating Jaap Mala count", error);
      throw error;
    }
  }
}

export const naamJaapApis = {
  getNaamJaapData: async (vsersion, currentPage, limit, lang) => {
    try {
      const response = await api.get(`${endPoints.naamJaap}-${vsersion}?page=${currentPage}&limit=${limit}&lang=${lang}`);
      return response.data;
    }
    catch(error) {
      console.error("Error fetching Naam Jaap data", error);
      throw error;
    }
  },

  getNaamJaapById: async(version, id, lang) => {
    try {
      const response = await api.get(`${endPoints.getSingleNaamJaap}-${version}/${id}?lang=${lang}`);
      return response.data;
    }
    catch(error) {
      console.error("Error fetching Naam Jaap by ID", error);
      throw error;
    }
  }
}


export const dailyThoughtsApis = {
  getDailyThought: async (version, lang) => {
    try {
      const response = await api.get(`${endPoints.todaysThought}-${version}?lang=${lang}`);
      return response.data;
    }
    catch (error) {
      console.error("Error fetching Daily Thought", error);
      throw error;
    }
  }
}
export default api;
