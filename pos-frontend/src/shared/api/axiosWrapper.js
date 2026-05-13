import axios from "axios";

const defaultHeader = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const axiosWrapper = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  timeout: 10000,
  headers: { ...defaultHeader },
});

// Request Interceptor to add token as fallback
axiosWrapper.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response Interceptor for global error handling
axiosWrapper.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;

    // If backend returns 401 (Unauthorized) and it's not a retry
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      window.location.pathname !== "/auth"
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosWrapper(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        axiosWrapper
          .post("/api/user/refresh-token")
          .then(({ data }) => {
            const newToken = data.token;
            localStorage.setItem("accessToken", newToken);
            axiosWrapper.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            processQueue(null, newToken);
            resolve(axiosWrapper(originalRequest));
          })
          .catch((err) => {
            processQueue(err, null);
            localStorage.removeItem("accessToken");
            window.location.href = "/auth";
            reject(err);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);
