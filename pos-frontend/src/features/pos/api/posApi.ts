import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// Branch Endpoints
export const getBranches = () => axiosWrapper.get("/api/branch");
export const addBranch = (data: any) => axiosWrapper.post("/api/branch", data);
export const updateBranch = ({ id, ...data }: { id: string; [key: string]: any }) => axiosWrapper.put(`/api/branch/${id}`, data);

// POS Point Endpoints
export const getPOSPoints = (branchId?: string) => axiosWrapper.get(`/api/pos-point${branchId ? `?branchId=${branchId}` : ""}`);
export const addPOSPoint = (data: any) => axiosWrapper.post("/api/pos-point", data);
export const updatePOSPoint = ({ id, ...data }: { id: string; [key: string]: any }) => axiosWrapper.put(`/api/pos-point/${id}`, data);

// Shift Endpoints
export const openShift = (data: any) => axiosWrapper.post("/api/shift/open", data);
export const closeShift = (shiftId: string, data: any) => axiosWrapper.post(`/api/shift/close/${shiftId}`, data);
export const getActiveShift = (posPointId: string) => axiosWrapper.get(`/api/shift/active?posPointId=${posPointId}`);
export const getShiftReconciliation = (shiftId: string) => axiosWrapper.get(`/api/shift/${shiftId}/reconciliation`);

// Category Endpoints
export const getCategories = () => axiosWrapper.get("/api/category");
export const addCategory = (data: any) => axiosWrapper.post("/api/category", data);
export const updateCategory = ({ categoryId, ...data }: { categoryId: string; [key: string]: any }) => axiosWrapper.put(`/api/category/${categoryId}`, data);
export const deleteCategory = (categoryId: string) => axiosWrapper.delete(`/api/category/${categoryId}`);

// Item Endpoints
export const getItems = (categoryId?: string) => axiosWrapper.get(categoryId ? `/api/item?categoryId=${categoryId}` : "/api/item");
export const addItem = (data: any) => axiosWrapper.post("/api/item", data);
export const updateItem = ({ itemId, ...data }: { itemId: string; [key: string]: any }) => axiosWrapper.put(`/api/item/${itemId}`, data);
export const deleteItem = (itemId: string) => axiosWrapper.delete(`/api/item/${itemId}`);

// Payment Endpoints
export const createOrderRazorpay = (data: any) =>
  axiosWrapper.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data: any) =>
  axiosWrapper.post("/api/payment/verify-payment", data);

// Order Endpoints
export const addOrder = (data: any) => axiosWrapper.post("/api/order", data);
