import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user/me");
export const logout = () => axiosWrapper.post("/api/user/logout");

// User Management Endpoints (Admin related but often co-located with user logic)
export const getUsers = () => axiosWrapper.get("/api/user");
export const createUser = (data) => axiosWrapper.post("/api/user", data);
export const updateUser = ({ userId, ...data }) => axiosWrapper.put(`/api/user/${userId}`, data);
export const deleteUser = (userId) => axiosWrapper.delete(`/api/user/${userId}`);
export const assignPOS = (data) => axiosWrapper.post("/api/user/assign-pos", data);
