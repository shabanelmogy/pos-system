import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// Getters
export const getBranches = () => axiosWrapper.get("/api/branch");
export const getPOSPoints = (branchId) => {
    const url = branchId ? `/api/pos-point?branchId=${branchId}` : "/api/pos-point";
    return axiosWrapper.get(url);
};
export const getCategories = () => axiosWrapper.get("/api/category");
export const getItems = () => axiosWrapper.get("/api/item");
export const getTables = () => axiosWrapper.get("/api/table");
export const getUsers = () => axiosWrapper.get("/api/user");
export const getCustomers = () => axiosWrapper.get("/api/customer");
export const getOrders = () => axiosWrapper.get("/api/order");
export const updateOrderStatus = ({ orderId, orderStatus }) => axiosWrapper.put(`/api/order/status/${orderId}`, { orderStatus });

// Management - Create
export const addBranch = (data) => axiosWrapper.post("/api/branch", data);
export const addPOSPoint = (data) => axiosWrapper.post("/api/pos-point", data);
export const addCategory = (data) => axiosWrapper.post("/api/category", data);
export const addItem = (data) => axiosWrapper.post("/api/item", data);
export const addTable = (data) => axiosWrapper.post("/api/table", data);
export const createUser = (data) => axiosWrapper.post("/api/user", data);

// Management - Update
export const updateBranch = (id, data) => axiosWrapper.put(`/api/branch/${id}`, data);
export const updatePOSPoint = (id, data) => axiosWrapper.put(`/api/pos-point/${id}`, data);
export const updateCategory = (id, data) => axiosWrapper.put(`/api/category/${id}`, data);
export const updateItem = (id, data) => axiosWrapper.put(`/api/item/${id}`, data);
export const updateTable = (id, data) => axiosWrapper.put(`/api/table/${id}`, data);
export const updateUser = (id, data) => axiosWrapper.put(`/api/user/${id}`, data);
export const assignPOS = (data) => axiosWrapper.post("/api/user/assign-pos", data);

// Management - Delete
export const deleteCategory = (id) => axiosWrapper.delete(`/api/category/${id}`);
export const deleteItem = (id) => axiosWrapper.delete(`/api/item/${id}`);
export const deleteTable = (id) => axiosWrapper.delete(`/api/table/${id}`);
export const deleteUser = (id) => axiosWrapper.delete(`/api/user/${id}`);

// Analytics
export const getDashboardMetrics = (branchId) => {
    const url = branchId && branchId !== "all" 
        ? `/api/dashboard/metrics?branchId=${branchId}` 
        : "/api/dashboard/metrics";
    return axiosWrapper.get(url);
};
