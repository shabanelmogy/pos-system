import { axiosWrapper } from "./axiosWrapper";

// API Endpoints

// Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user/me");
export const logout = () => axiosWrapper.post("/api/user/logout");

// Table Endpoints
export const addTable = (data) => axiosWrapper.post("/api/table", data);
export const getTables = () => axiosWrapper.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);

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

// Order Endpoints
export const addOrder = (data) => axiosWrapper.post("/api/order", data);
export const getOrders = () => axiosWrapper.get("/api/order");
export const updateOrder = ({ orderId, ...orderData }) =>
  axiosWrapper.put(`/api/order/${orderId}`, orderData);
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });
