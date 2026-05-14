import { axiosWrapper } from "../../../shared/api/axiosWrapper";

const API_BASE = "/api/config";

export const configApi = {
  // Profiles
  getProfiles: () => axiosWrapper.get(`${API_BASE}/profiles`),
  getProfile: (id: string) => axiosWrapper.get(`${API_BASE}/profiles/${id}`),
  createProfile: (data: any) => axiosWrapper.post(`${API_BASE}/profiles`, data),
  updateProfile: (id: string, data: any) => axiosWrapper.put(`${API_BASE}/profiles/${id}`, data),
  deleteProfile: (id: string) => axiosWrapper.delete(`${API_BASE}/profiles/${id}`),

  // Assignments
  getAssignments: (profileId: string) => axiosWrapper.get(`${API_BASE}/assignments?profileId=${profileId}`),
  createAssignment: (data: { profileId: string; targetId: string; targetType: "PRODUCT" | "CATEGORY" }) => 
    axiosWrapper.post(`${API_BASE}/assignments`, data),
  deleteAssignment: (id: string) => axiosWrapper.delete(`${API_BASE}/assignments/${id}`),
  
  searchTargets: (query: string, type: "PRODUCT" | "CATEGORY") => 
    axiosWrapper.get(`/api/${type === "PRODUCT" ? "item" : "category"}?q=${query}`),
  
  configurePricing: (profileId: string, rules: any) => 
    axiosWrapper.post(`${API_BASE}/profiles/${profileId}/pricing`, { rules }),

  getCategories: () => axiosWrapper.get("/api/category"),
  getItemsByCategory: (categoryId: string) => axiosWrapper.get(`/api/item?categoryId=${categoryId}`),
};
