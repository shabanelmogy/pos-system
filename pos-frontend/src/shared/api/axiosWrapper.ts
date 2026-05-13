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
export const axiosWrapper: AxiosInstance = axios.create({
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
axiosWrapper.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("accessToken");
    
    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response Interceptor: 401 handling with concurrent refresh and retry.
 */
axiosWrapper.interceptors.response.use(
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
          return axiosWrapper(originalRequest);
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
        return axiosWrapper(originalRequest);
      } catch (refreshError) {
        clearQueue(refreshError);
        localStorage.removeItem("accessToken");
        
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
