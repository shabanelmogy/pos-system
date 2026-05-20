import { httpClient } from "@/shared/api/httpClient";
import { 
    Branch, POSPoint, Category, MenuItem as Item, User, UserRole 
} from "@/shared/types";

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
export const getBranches = () => httpClient.get<{ data: Branch[] }>("/api/branch");
export const getPOSPoints = (branchId?: string) => {
    const url = branchId ? `/api/pos-point?branchId=${branchId}` : "/api/pos-point";
    return httpClient.get<{ data: POSPoint[] }>(url);
};
export const getCategories = () => httpClient.get<{ data: Category[] }>("/api/category");
export const getItems = () => httpClient.get<{ data: Item[] }>("/api/item");
export const getTables = () => httpClient.get<{ data: Table[] }>("/api/table");
export const getUsers = () => httpClient.get<{ data: User[] }>("/api/user");
export const getCustomers = () => httpClient.get<{ data: any[] }>("/api/customer");
export const getOrders = () => httpClient.get<{ data: any[] }>("/api/order");
export const getShifts = (params: any = {}) => httpClient.get<{ data: any[] }>("/api/shift", { params });
export const getKitchenStations = (branchId?: string) => httpClient.get<{ data: any[] }>("/api/kitchen-station", { params: { branchId } });
export const updateOrderLifecycle = ({ orderId, lifecycle, settleWithCash }: { orderId: string; lifecycle: string; settleWithCash?: boolean }) => 
    httpClient.patch(`/api/order/${orderId}/lifecycle`, { lifecycle, settleWithCash });
export const updateOrderFulfillment = ({ orderId, fulfillmentStatus }: { orderId: string; fulfillmentStatus: string }) => 
    httpClient.patch(`/api/order/${orderId}/fulfillment`, { fulfillmentStatus });

// Coupons
export const getCoupons = () => httpClient.get("/api/coupon");
export const addCoupon = (data: any) => httpClient.post("/api/coupon", data);
export const updateCoupon = (id: string, data: any) => httpClient.put(`/api/coupon/${id}`, data);

// Management - Create
export const addBranch = (data: Partial<Branch>) => httpClient.post("/api/branch", data);
export const addPOSPoint = (data: Partial<POSPoint>) => httpClient.post("/api/pos-point", data);
export const addCategory = (data: Partial<Category>) => httpClient.post("/api/category", data);
export const addItem = (data: Partial<Item>) => httpClient.post("/api/item", data);
export const addTable = (data: Partial<Table>) => httpClient.post("/api/table", data);
export const addKitchenStation = (data: any) => httpClient.post("/api/kitchen-station", data);
export const createUser = (data: Partial<User>) => httpClient.post("/api/user", data);

// Management - Update
export const updateBranch = (id: string, data: Partial<Branch>) => httpClient.put(`/api/branch/${id}`, data);
export const updatePOSPoint = (id: string, data: Partial<POSPoint>) => httpClient.put(`/api/pos-point/${id}`, data);
export const updateCategory = (id: string, data: Partial<Category>) => httpClient.put(`/api/category/${id}`, data);
export const updateItem = (id: string, data: Partial<Item>) => httpClient.put(`/api/item/${id}`, data);
export const updateTable = (id: string, data: Partial<Table>) => httpClient.put(`/api/table/${id}`, data);
export const updateKitchenStation = (id: string, data: any) => httpClient.put(`/api/kitchen-station/${id}`, data);
export const updateUser = (id: string, data: Partial<User>) => httpClient.put(`/api/user/${id}`, data);
export const assignPOS = (data: { userId: string; posPointIds: string[] }) => httpClient.post("/api/user/assign-pos", data);

// Management - Delete
export const deleteCategory = (id: string) => httpClient.delete(`/api/category/${id}`);
export const deleteItem = (id: string) => httpClient.delete(`/api/item/${id}`);
export const deleteTable = (id: string) => httpClient.delete(`/api/table/${id}`);
export const deleteKitchenStation = (id: string) => httpClient.delete(`/api/kitchen-station/${id}`);
export const deleteUser = (id: string) => httpClient.delete(`/api/user/${id}`);

// Analytics
export const getDashboardMetrics = (branchId?: string) => {
    const url = branchId && branchId !== "all" 
        ? `/api/dashboard/metrics?branchId=${branchId}` 
        : "/api/dashboard/metrics";
    return httpClient.get(url);
};
