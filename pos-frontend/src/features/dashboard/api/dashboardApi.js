import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// Getters
export const getBranches = () => axiosWrapper.get("/branch/all");
export const getPOSPoints = (branchId) => {
    const url = branchId ? `/pos/all?branchId=${branchId}` : "/pos/all";
    return axiosWrapper.get(url);
};
export const getCategories = () => axiosWrapper.get("/category/all");
export const getItems = () => axiosWrapper.get("/item/all");
export const getTables = () => axiosWrapper.get("/table/all");
export const getUsers = () => axiosWrapper.get("/user/all");
export const getCustomers = () => axiosWrapper.get("/customer/all");
export const getOrders = () => axiosWrapper.get("/order/all");
export const updateOrderStatus = ({ orderId, orderStatus }) => axiosWrapper.put(`/order/update-status/${orderId}`, { orderStatus });

// Management - Create
export const addBranch = (data) => axiosWrapper.post("/branch/add", data);
export const addPOSPoint = (data) => axiosWrapper.post("/pos/add", data);
export const addCategory = (data) => axiosWrapper.post("/category/add", data);
export const addItem = (data) => axiosWrapper.post("/item/add", data);
export const addTable = (data) => axiosWrapper.post("/table/add", data);
export const createUser = (data) => axiosWrapper.post("/user/register", data);

// Management - Update
export const updateBranch = (data) => axiosWrapper.put(`/branch/update`, data);
export const updatePOSPoint = (data) => axiosWrapper.put(`/pos/update`, data);
export const updateCategory = (data) => axiosWrapper.put(`/category/update`, data);
export const updateItem = (data) => axiosWrapper.put(`/item/update`, data);
export const updateTable = (data) => axiosWrapper.put(`/table/update`, data);
export const updateUser = (data) => axiosWrapper.put(`/user/update`, data);
export const assignPOS = (data) => axiosWrapper.post("/user/assign-pos", data);

// Management - Delete
export const deleteCategory = (id) => axiosWrapper.delete(`/category/${id}`);
export const deleteItem = (id) => axiosWrapper.delete(`/item/${id}`);
export const deleteTable = (id) => axiosWrapper.delete(`/table/${id}`);
export const deleteUser = (id) => axiosWrapper.delete(`/user/${id}`);

// Analytics
export const getDashboardMetrics = (branchId) => {
    const url = branchId && branchId !== "all" 
        ? `/dashboard/metrics?branchId=${branchId}` 
        : "/dashboard/metrics";
    return axiosWrapper.get(url);
};
