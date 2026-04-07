import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import toast from "react-hot-toast";
import { clearStoredAuth, getStoredAccessToken, getStoredRefreshToken, storeAuth } from "./tokens";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const authClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function redirectToLogin() {
  if (window.location.pathname !== "/login") {
    const currentPath = `${window.location.pathname}${window.location.search}`;
    const redirect = encodeURIComponent(currentPath);
    window.location.assign(`/login?redirect=${redirect}`);
  }
}

apiClient.interceptors.request.use((config) => {
  const token = getStoredAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status === 429) {
      const retryAfter = error.response.headers["retry-after"];
      const seconds = Number(retryAfter ?? 60);
      const value = Number.isFinite(seconds) ? seconds : 60;
      toast.error(`Rate limit reached. Try again in ${value} seconds.`);
    }

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      clearStoredAuth();
      redirectToLogin();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const response = await authClient.post("/auth/refresh", {
        refresh_token: refreshToken,
      });

      storeAuth(response.data);
      originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      clearStoredAuth();
      redirectToLogin();
      return Promise.reject(refreshError);
    }
  },
);
