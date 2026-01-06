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

    // Add timestamp for duration calculation
    if (config.headers) {
      config.headers["request-startTime"] = Date.now().toString();
    }

    // Log request
    console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
      params: config.params,
      data: config.data,
      headers: {
        Authorization: config.headers?.Authorization ? "✓ Bearer token" : "✗ No token",
      },
    });

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
    // Log successful response
    console.log(`✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`, {
      data: response.data,
      duration: response.config.headers?.["request-startTime"]
        ? `${Date.now() - Number(response.config.headers["request-startTime"])}ms`
        : "N/A",
    });
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

    // Log error response
    const status = error.response?.status || "ERR";
    const url = error.config?.url || "Unknown";
    const method = error.config?.method?.toUpperCase() || "GET";

    console.error(`❌ ${status} ${method} ${url}`, {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      statusText: error.response?.statusText,
    });

    return Promise.reject(error);
  }
);

export default axiosClient;
