import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    }
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem("authToken");
        if(token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response: AxiosResponse) => {
        return response;
    },
    (error: AxiosError) => {
        if(error.response?.status === 401) {
            // Handle Unauthorized access
            localStorage.removeItem("authToken");
            window.location.href = "/"; // Redirect to login page
        }
        return Promise.reject(error);
    }
);


export const homePageApis = {
    
}


export const rashifalApis = {

}

export const panchangApis = {

}

export const hindiCalendarApis = {

}

export const vratKathaApis ={

}

export const jaapMalaApis = {

}

export const poojaApis = {
    
}


export const paymentApis = {

}

export default api;

