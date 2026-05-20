import { httpClient } from "@/shared/api/httpClient";
import { User } from "@/shared/types";

// Auth Endpoints
export const login = (data: any) => httpClient.post("/api/user/login", data);
export const register = (data: any) => httpClient.post("/api/user/register", data);
export const getUserData = () => httpClient.get<{ data: User; activeShift: any }>("/api/user/me");
export const logout = () => httpClient.post("/api/user/logout");

// User Management Endpoints
export const getUsers = () => httpClient.get<{ data: User[] }>("/api/user");
export const createUser = (data: any) => httpClient.post("/api/user", data);
export const updateUser = ({ userId, ...data }: { userId: string; [key: string]: any }) => 
  httpClient.put(`/api/user/${userId}`, data);
export const deleteUser = (userId: string) => httpClient.delete(`/api/user/${userId}`);
export const assignPOS = (data: any) => httpClient.post("/api/user/assign-pos", data);
