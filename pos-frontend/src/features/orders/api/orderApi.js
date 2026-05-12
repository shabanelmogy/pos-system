import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// Order Endpoints
export const getOrders = (params = {}) => axiosWrapper.get("/api/order", { params });
export const updateOrder = ({ orderId, ...orderData }) =>
  axiosWrapper.put(`/api/order/${orderId}`, orderData);
export const updateOrderStatus = ({ orderId, orderStatus }) =>
  axiosWrapper.put(`/api/order/${orderId}`, { orderStatus });

// Bill Endpoints
export const getBills = () => axiosWrapper.get("/api/bill");
export const getBillById = (id) => axiosWrapper.get(`/api/bill/${id}`);
export const getBillByOrderId = (orderId) => axiosWrapper.get(`/api/bill/order/${orderId}`);
export const updateBillStatus = ({ id, status }) => axiosWrapper.patch(`/api/bill/status/${id}`, { status });
