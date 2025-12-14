import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { API_BASE_URL, DEFAULT_HEADERS } from "../config";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: DEFAULT_HEADERS,
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let subscribers: ((token: string) => void)[] = [];

// ----- RESPONSE INTERCEPTOR -----
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const skipRefreshUrls = ["/auth/login", "/auth/register", "/auth/confirm"];
    const shouldSkipRefresh = skipRefreshUrls.some((url) => originalRequest?.url?.includes(url));

    if (error.response?.status === 401 && !originalRequest._retry && !shouldSkipRefresh) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribers.push((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          withCredentials: true,
          headers: DEFAULT_HEADERS,
        });
        const newAccessToken = res.data?.data?.accessToken || res.data?.accessToken;

        if (newAccessToken) {
          try {
            localStorage.setItem("accessToken", newAccessToken);
          } catch {
            /* ignore storage errors */
          }

          subscribers.forEach((cb) => cb(newAccessToken));
          subscribers = [];
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosClient(originalRequest);
        }

        throw new Error("Refresh did not return new access token");
      } catch (refreshError) {
        isRefreshing = false;
        subscribers = [];
        try {
          localStorage.removeItem("accessToken");
        } catch {
          /* ignore */
        }
        console.error("Refresh token failed", refreshError);

        // Notify app to perform a global logout (update UI state)
        try {
          window.dispatchEvent(new Event("app:logout"));
        } catch {
          /* ignore in non-browser env */
        }

        return Promise.reject(refreshError);
      }
    }

    console.error(`Request failed: ${error.response?.status || "ERR"} ${error.config?.url || "Unknown"}`);

    return Promise.reject(error);
  }
);

export default axiosClient;
