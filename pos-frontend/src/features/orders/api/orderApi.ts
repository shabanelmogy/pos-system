import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// Order Endpoints
export const getOrders = (params: any = {}) => axiosWrapper.get("/api/order", { params });
export const updateOrderLifecycle = ({ orderId, lifecycle, settleWithCash }: { orderId: string; lifecycle: string; settleWithCash?: boolean }) =>
  axiosWrapper.patch(`/api/order/${orderId}/lifecycle`, { status: lifecycle, settleWithCash });

export const updateOrderFulfillment = ({ orderId, fulfillmentStatus }: { orderId: string; fulfillmentStatus: string }) =>
  axiosWrapper.patch(`/api/order/${orderId}/fulfillment`, { fulfillmentStatus });

export const confirmOrderDraft = (orderId: string) =>
  axiosWrapper.patch(`/api/order/${orderId}/confirm`, {});

export const applyOrderCoupon = ({ orderId, code }: { orderId: string; code: string }) =>
  axiosWrapper.post(`/api/order/${orderId}/apply-coupon`, { code });

export const validateCoupon = (code: string, orderAmount: number) =>
  axiosWrapper.get(`/api/coupon/validate`, { params: { code, orderAmount } });

export const addOrderPayment = ({ orderId, amount, method, transactionId }: { orderId: string; amount: number; method: string; transactionId?: string }) =>
  axiosWrapper.post(`/api/order/${orderId}/add-payment`, { amount, method, transactionId });

// Bill Endpoints
export const getBills = () => axiosWrapper.get("/api/bill");
export const getBillById = (id: string) => axiosWrapper.get(`/api/bill/${id}`);
export const getBillByOrderId = (orderId: string) => axiosWrapper.get(`/api/bill/order/${orderId}`);
export const updateBillStatus = ({ id, status }: { id: string; status: string }) => axiosWrapper.patch(`/api/bill/status/${id}`, { status });
