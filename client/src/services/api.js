import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://k8s-mediconn-mediconn-48472646cb-719345857.ap-south-1.elb.amazonaws.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mc_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Global 401 handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mc_token");
      localStorage.removeItem("mc_user");
    }
    return Promise.reject(error);
  }
);

export const UPLOADS_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export default api;