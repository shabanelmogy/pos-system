import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// Order Endpoints
export const getOrders = (params: any = {}) => axiosWrapper.get("/api/order", { params });
export const updateOrder = ({ orderId, ...orderData }: { orderId: string; [key: string]: any }) =>
  axiosWrapper.put(`/api/order/${orderId}`, orderData);
export const updateOrderStatus = ({ orderId, orderStatus }: { orderId: string; orderStatus: string }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });

// Bill Endpoints
export const getBills = () => axiosWrapper.get("/api/bill");
export const getBillById = (id: string) => axiosWrapper.get(`/api/bill/${id}`);
export const getBillByOrderId = (orderId: string) => axiosWrapper.get(`/api/bill/order/${orderId}`);
export const updateBillStatus = ({ id, status }: { id: string; status: string }) => axiosWrapper.patch(`/api/bill/status/${id}`, { status });
