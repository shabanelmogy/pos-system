import axios from "axios";

const defaultHeader = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export const axiosWrapper = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
  headers: { ...defaultHeader },
});

// Response Interceptor for global error handling
axiosWrapper.interceptors.response.use(
  (response) => response,
  (error) => {
    // If backend returns 401 (Unauthorized), redirect to login
    // ONLY if we are not already on the auth page to avoid infinite loops
    if (
      error.response &&
      error.response.status === 401 &&
      window.location.pathname !== "/auth"
    ) {
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);
