import axios from "axios";
import { clearToken, getToken } from "../utils/auth.js";
import { getUserToken, clearUserToken } from "../utils/userAuth.js";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true // ✅ THIS IS THE FIX
});


api.interceptors.request.use((config) => {
  // For admin (auth.js token)
  const adminToken = getToken();
  if (adminToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }

  // For user (userAuth.js token) - if no admin token, use user token
  const userToken = getUserToken();
  if (userToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    
    // Only logout on 401 from authentication endpoints
    // Do NOT logout on credit/permission errors (403) or other failures
    if (status === 401) {
      const isAuthEndpoint = url.includes("/auth/") || url.includes("/users/me");
      const message = error.response?.data?.message || "";
      const isAuthFailure = isAuthEndpoint || 
                           message.includes("Token invalid") || 
                           message.includes("Token expired") ||
                           message.includes("Not authorized");
      
      // Only logout if it's actually an authentication failure
      if (isAuthFailure) {
        clearToken();
        clearUserToken();
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
