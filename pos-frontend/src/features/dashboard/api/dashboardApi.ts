import { axiosWrapper } from "../../../shared/api/axiosWrapper";
import { 
    Branch, POSPoint, Category, MenuItem as Item, User, UserRole 
} from "../../../shared/types";

export interface Table {
    id: string;
    tableId: string;
    tableNo: number;
    seats: number;
    status: string;
    branchId: string;
}

// Re-export shared types for convenience
export type { Branch, POSPoint, Category, Item, User, UserRole };

// Getters
export const getBranches = () => axiosWrapper.get<{ data: Branch[] }>("/api/branch");
export const getPOSPoints = (branchId?: string) => {
    const url = branchId ? `/api/pos-point?branchId=${branchId}` : "/api/pos-point";
    return axiosWrapper.get<{ data: POSPoint[] }>(url);
};
export const getCategories = () => axiosWrapper.get<{ data: Category[] }>("/api/category");
export const getItems = () => axiosWrapper.get<{ data: Item[] }>("/api/item");
export const getTables = () => axiosWrapper.get<{ data: Table[] }>("/api/table");
export const getUsers = () => axiosWrapper.get<{ data: User[] }>("/api/user");
export const getCustomers = () => axiosWrapper.get<{ data: any[] }>("/api/customer");
export const getOrders = () => axiosWrapper.get<{ data: any[] }>("/api/order");
export const getShifts = (params: any = {}) => axiosWrapper.get<{ data: any[] }>("/api/shift", { params });
export const updateOrderLifecycle = ({ orderId, lifecycle, settleWithCash }: { orderId: string; lifecycle: string; settleWithCash?: boolean }) => 
    axiosWrapper.patch(`/api/order/${orderId}/lifecycle`, { lifecycle, settleWithCash });
export const updateOrderFulfillment = ({ orderId, fulfillmentStatus }: { orderId: string; fulfillmentStatus: string }) => 
    axiosWrapper.patch(`/api/order/${orderId}/fulfillment`, { fulfillmentStatus });

// Coupons
export const getCoupons = () => axiosWrapper.get("/api/coupon");
export const addCoupon = (data: any) => axiosWrapper.post("/api/coupon", data);
export const updateCoupon = (id: string, data: any) => axiosWrapper.put(`/api/coupon/${id}`, data);

// Management - Create
export const addBranch = (data: Partial<Branch>) => axiosWrapper.post("/api/branch", data);
export const addPOSPoint = (data: Partial<POSPoint>) => axiosWrapper.post("/api/pos-point", data);
export const addCategory = (data: Partial<Category>) => axiosWrapper.post("/api/category", data);
export const addItem = (data: Partial<Item>) => axiosWrapper.post("/api/item", data);
export const addTable = (data: Partial<Table>) => axiosWrapper.post("/api/table", data);
export const createUser = (data: Partial<User>) => axiosWrapper.post("/api/user", data);

// Management - Update
export const updateBranch = (id: string, data: Partial<Branch>) => axiosWrapper.put(`/api/branch/${id}`, data);
export const updatePOSPoint = (id: string, data: Partial<POSPoint>) => axiosWrapper.put(`/api/pos-point/${id}`, data);
export const updateCategory = (id: string, data: Partial<Category>) => axiosWrapper.put(`/api/category/${id}`, data);
export const updateItem = (id: string, data: Partial<Item>) => axiosWrapper.put(`/api/item/${id}`, data);
export const updateTable = (id: string, data: Partial<Table>) => axiosWrapper.put(`/api/table/${id}`, data);
export const updateUser = (id: string, data: Partial<User>) => axiosWrapper.put(`/api/user/${id}`, data);
export const assignPOS = (data: { userId: string; posPointIds: string[] }) => axiosWrapper.post("/api/user/assign-pos", data);

// Management - Delete
export const deleteCategory = (id: string) => axiosWrapper.delete(`/api/category/${id}`);
export const deleteItem = (id: string) => axiosWrapper.delete(`/api/item/${id}`);
export const deleteTable = (id: string) => axiosWrapper.delete(`/api/table/${id}`);
export const deleteUser = (id: string) => axiosWrapper.delete(`/api/user/${id}`);

// Analytics
export const getDashboardMetrics = (branchId?: string) => {
    const url = branchId && branchId !== "all" 
        ? `/api/dashboard/metrics?branchId=${branchId}` 
        : "/api/dashboard/metrics";
    return axiosWrapper.get(url);
};
