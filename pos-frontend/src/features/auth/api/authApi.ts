import { axiosWrapper } from "../../../shared/api/axiosWrapper";
import { User } from "../../../shared/types";

// Auth Endpoints
export const login = (data: any) => axiosWrapper.post("/api/user/login", data);
export const register = (data: any) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get<{ data: User; activeShift: any }>("/api/user/me");
export const logout = () => axiosWrapper.post("/api/user/logout");

// User Management Endpoints
export const getUsers = () => axiosWrapper.get<{ data: User[] }>("/api/user");
export const createUser = (data: any) => axiosWrapper.post("/api/user", data);
export const updateUser = ({ userId, ...data }: { userId: string; [key: string]: any }) => 
  axiosWrapper.put(`/api/user/${userId}`, data);
export const deleteUser = (userId: string) => axiosWrapper.delete(`/api/user/${userId}`);
export const assignPOS = (data: any) => axiosWrapper.post("/api/user/assign-pos", data);
