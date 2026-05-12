import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// Branch Endpoints
export const getBranches = () => axiosWrapper.get("/api/branch");
export const addBranch = (data) => axiosWrapper.post("/api/branch", data);
export const updateBranch = ({ id, ...data }) => axiosWrapper.put(`/api/branch/${id}`, data);

// POS Point Endpoints
export const getPOSPoints = (branchId) => axiosWrapper.get(`/api/pos-point${branchId ? `?branchId=${branchId}` : ""}`);
export const addPOSPoint = (data) => axiosWrapper.post("/api/pos-point", data);
export const updatePOSPoint = ({ id, ...data }) => axiosWrapper.put(`/api/pos-point/${id}`, data);

// Shift Endpoints
export const openShift = (data) => axiosWrapper.post("/api/shift/open", data);
export const closeShift = (shiftId, data) => axiosWrapper.post(`/api/shift/close/${shiftId}`, data);
export const getActiveShift = (posPointId) => axiosWrapper.get(`/api/shift/active?posPointId=${posPointId}`);

// Category Endpoints
export const getCategories = () => axiosWrapper.get("/api/category");
export const addCategory = (data) => axiosWrapper.post("/api/category", data);
export const updateCategory = ({ categoryId, ...data }) => axiosWrapper.put(`/api/category/${categoryId}`, data);
export const deleteCategory = (categoryId) => axiosWrapper.delete(`/api/category/${categoryId}`);

// Item Endpoints
export const getItems = (categoryId) => axiosWrapper.get(categoryId ? `/api/item?categoryId=${categoryId}` : "/api/item");
export const addItem = (data) => axiosWrapper.post("/api/item", data);
export const updateItem = ({ itemId, ...data }) => axiosWrapper.put(`/api/item/${itemId}`, data);
export const deleteItem = (itemId) => axiosWrapper.delete(`/api/item/${itemId}`);

// Payment Endpoints
export const createOrderRazorpay = (data) =>
  axiosWrapper.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data) =>
  axiosWrapper.post("/api/payment/verify-payment", data);

// Order Endpoints (Order creation is part of POS)
export const addOrder = (data) => axiosWrapper.post("/api/order", data);
