import { httpClient } from "@/shared/api/httpClient";

// Branch Endpoints
export const getBranches = () => httpClient.get("/api/branch");
export const addBranch = (data: any) => httpClient.post("/api/branch", data);
export const updateBranch = ({ id, ...data }: { id: string; [key: string]: any }) => httpClient.put(`/api/branch/${id}`, data);

// POS Point Endpoints
export const getPOSPoints = (branchId?: string) => httpClient.get(`/api/pos-point${branchId ? `?branchId=${branchId}` : ""}`);
export const addPOSPoint = (data: any) => httpClient.post("/api/pos-point", data);
export const updatePOSPoint = ({ id, ...data }: { id: string; [key: string]: any }) => httpClient.put(`/api/pos-point/${id}`, data);

// Shift Endpoints
export const openShift = (data: any) => httpClient.post("/api/shift/open", data);
export const closeShift = (shiftId: string, data: any) => httpClient.post(`/api/shift/close/${shiftId}`, data);
export const getActiveShift = (posPointId: string) => httpClient.get(`/api/shift/active?posPointId=${posPointId}`);
export const getShiftReconciliation = (shiftId: string) => httpClient.get(`/api/shift/${shiftId}/reconciliation`);

// Category Endpoints
export const getCategories = () => httpClient.get("/api/category");
export const getCategoryTree = () => httpClient.get("/api/category/tree");
export const addCategory = (data: any) => httpClient.post("/api/category", data);
export const updateCategory = ({ categoryId, ...data }: { categoryId: string; [key: string]: any }) => httpClient.put(`/api/category/${categoryId}`, data);
export const deleteCategory = (categoryId: string) => httpClient.delete(`/api/category/${categoryId}`);

// Item Endpoints
export const getItems = (categoryId?: string) => httpClient.get(categoryId ? `/api/item?categoryId=${categoryId}` : "/api/item");
export const addItem = (data: any) => httpClient.post("/api/item", data);
export const updateItem = ({ itemId, ...data }: { itemId: string; [key: string]: any }) => httpClient.put(`/api/item/${itemId}`, data);
export const deleteItem = (itemId: string) => httpClient.delete(`/api/item/${itemId}`);

// Payment Endpoints
export const createOrderRazorpay = (data: any) =>
  httpClient.post("/api/payment/create-order", data);
export const verifyPaymentRazorpay = (data: any) =>
  httpClient.post("/api/payment/verify-payment", data);

// Order Endpoints
export const addOrder = (data: any) => httpClient.post("/api/order", data);

// Image Upload Endpoint
export const uploadImage = (base64Data: string) => httpClient.post("/api/upload", { image: base64Data });
