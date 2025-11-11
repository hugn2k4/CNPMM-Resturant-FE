import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { API_BASE_URL, DEFAULT_HEADERS } from "../config";

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: DEFAULT_HEADERS,
  withCredentials: true,
});

// Generate unique request ID
let requestId = 0;
function generateRequestId(): number {
  return ++requestId;
}

// ----- REQUEST INTERCEPTOR -----
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Generate and attach request ID
    const reqId = generateRequestId();
    config.headers["X-Request-ID"] = reqId.toString();

    const token = localStorage.getItem("accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request with ID
    console.log(`🔹 [${reqId}] Request:`, {
      url: config.url,
      method: config.method?.toUpperCase(),
      data: config.data,
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
    // Get request ID from headers
    const reqId = response.config.headers["X-Request-ID"] || "?";

    // Log response with matching ID
    console.log(`✅ [${reqId}] Response:`, {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });

    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const reqId = originalRequest?.headers?.["X-Request-ID"] || "?";

    // ----- Handle 401 + Refresh token -----
    if (error.response?.status === 401 && !originalRequest._retry) {
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
        console.log(`🔄 [${reqId}] Refreshing token...`);
        // Use plain axios (no interceptors) to avoid re-entering this interceptor
        const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, null, {
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

          // notify queued requests
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
        console.error(`❌ [${reqId}] Refresh token failed`, refreshError);

        // Notify app to perform a global logout (update UI state)
        try {
          window.dispatchEvent(new Event("app:logout"));
        } catch {
          /* ignore in non-browser env */
        }

        return Promise.reject(refreshError);
      }
    }

    // Log error with request ID
    console.error(`❌ [${reqId}] ${error.response?.status || "ERR"} ${error.config?.url || "Unknown"}`);

    return Promise.reject(error);
  }
);

export default axiosClient;
