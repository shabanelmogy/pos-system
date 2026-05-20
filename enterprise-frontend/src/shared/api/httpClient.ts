import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  AxiosHeaders
} from "axios";

/**
 * Type Definitions
 */
interface RefreshResponse {
  token: string;
}

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export class AuthRefreshError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthRefreshError";
  }
}

/**
 * Constants & Config
 */
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const AUTH_UI_PREFIX = "/auth";
const EXCLUDED_API_ENDPOINTS = [
  "/api/user/login",
  "/api/user/register",
  "/api/user/refresh-token"
];

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

/**
 * Isolated Axios instance for token rotation to avoid interceptor recursion.
 */
const refreshClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 5000,
  headers: DEFAULT_HEADERS,
});

/**
 * Main application API client.
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
  headers: DEFAULT_HEADERS,
});

let isRefreshing = false;
let failedQueue: QueuedRequest[] = [];

/**
 * Clears the concurrent request queue.
 */
const clearQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else if (token) {
      request.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor: Automatic token attachment.
 */
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const language = localStorage.getItem("i18nextLng");
    if (language) {
      config.headers["Accept-Language"] = language;
    }

    // Attach active shift/pos context from persisted store so the backend
    // doesn't have to derive it from DB permissions (which can be stale or missing).
    try {
      const posStorage = localStorage.getItem("pos-storage");
      if (posStorage) {
        const { state } = JSON.parse(posStorage);
        if (state?.activeShift?.id) {
          config.headers["x-shift-id"] = state.activeShift.id;
        }
        if (state?.selectedPOSPoint?.id) {
          config.headers["x-pos-point-id"] = state.selectedPOSPoint.id;
        }
      }
    } catch (_) {
      // silently ignore if localStorage is unavailable
    }
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response Interceptor: 401 handling with concurrent refresh and retry.
 */
httpClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError): Promise<AxiosResponse | unknown> => {
    const originalRequest = error.config as RetryConfig;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const currentPath = window.location.pathname;
    const isInsideAuthUI = currentPath.startsWith(AUTH_UI_PREFIX);
    const isExcludedApi = EXCLUDED_API_ENDPOINTS.some(route => originalRequest.url === route || originalRequest.url?.startsWith(`${route}?`));

    if (error.response.status === 401 && !originalRequest._retry && !isExcludedApi) {
      if (isRefreshing) {
        try {
          const token = await new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return httpClient(originalRequest);
        } catch (queueError) {
          return Promise.reject(queueError);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await refreshClient.post<RefreshResponse>("/api/user/refresh-token");
        const newToken = data.token;

        if (!newToken) {
          throw new AuthRefreshError("MISSING_TOKEN_IN_REFRESH_RESPONSE");
        }

        localStorage.setItem("accessToken", newToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        clearQueue(null, newToken);
        return httpClient(originalRequest);
      } catch (refreshError) {
        clearQueue(refreshError);
        localStorage.removeItem("accessToken");
        
        // Clear local stores to prevent infinite redirect loops
        localStorage.removeItem("user-storage");
        localStorage.removeItem("pos-storage");
        
        if (!isInsideAuthUI) {
          window.location.href = AUTH_UI_PREFIX;
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
