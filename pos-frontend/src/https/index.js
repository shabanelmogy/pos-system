import { axiosWrapper } from "./axiosWrapper";

// Auth Endpoints
export const login = (data) => axiosWrapper.post("/api/user/login", data);
export const register = (data) => axiosWrapper.post("/api/user/register", data);
export const getUserData = () => axiosWrapper.get("/api/user/me");
export const logout = () => axiosWrapper.post("/api/user/logout");

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

// Table Endpoints
export const addTable = (data) => axiosWrapper.post("/api/table", data);
export const getTables = () => axiosWrapper.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);
export const deleteTable = (tableId) => axiosWrapper.delete(`/api/table/${tableId}`);

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

// Customer Endpoints
export const getCustomers = () => axiosWrapper.get("/api/customer");
export const getCustomerById = (id) => axiosWrapper.get(`/api/customer/${id}`);
export const addCustomer = (data) => axiosWrapper.post("/api/customer", data);
export const updateCustomer = ({ id, ...data }) => axiosWrapper.put(`/api/customer/${id}`, data);

// Bill Endpoints
export const getBills = () => axiosWrapper.get("/api/bill");
export const getBillById = (id) => axiosWrapper.get(`/api/bill/${id}`);
export const getBillByOrderId = (orderId) => axiosWrapper.get(`/api/bill/order/${orderId}`);
export const updateBillStatus = ({ id, status }) => axiosWrapper.patch(`/api/bill/status/${id}`, { status });

// User Management Endpoints
export const getUsers = () => axiosWrapper.get("/api/user");
export const createUser = (data) => axiosWrapper.post("/api/user", data);
export const updateUser = ({ userId, ...data }) => axiosWrapper.put(`/api/user/${userId}`, data);
export const deleteUser = (userId) => axiosWrapper.delete(`/api/user/${userId}`);
export const assignPOS = (data) => axiosWrapper.post("/api/user/assign-pos", data);
