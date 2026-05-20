import { httpClient } from "@/shared/api/httpClient";

// Order Endpoints
export const getOrders = (params: any = {}) => httpClient.get("/api/order", { params });
export const updateOrderLifecycle = ({ orderId, lifecycle, settleWithCash }: { orderId: string; lifecycle: string; settleWithCash?: boolean }) =>
  httpClient.patch(`/api/order/${orderId}/lifecycle`, { status: lifecycle, settleWithCash });

export const updateOrderFulfillment = ({ orderId, fulfillmentStatus }: { orderId: string; fulfillmentStatus: string }) =>
  httpClient.patch(`/api/order/${orderId}/fulfillment`, { fulfillmentStatus });

export const confirmOrderDraft = (orderId: string) =>
  httpClient.patch(`/api/order/${orderId}/confirm`, {});

export const applyOrderCoupon = ({ orderId, code }: { orderId: string; code: string }) =>
  httpClient.post(`/api/order/${orderId}/apply-coupon`, { code });

export const validateCoupon = (code: string, orderAmount: number) =>
  httpClient.get(`/api/coupon/validate`, { params: { code, orderAmount } });

export const addOrderPayment = ({ orderId, amount, method, transactionId }: { orderId: string; amount: number; method: string; transactionId?: string }) =>
  httpClient.post(`/api/order/${orderId}/add-payment`, { amount, method, transactionId });

// Bill Endpoints
export const getBills = () => httpClient.get("/api/bill");
export const getBillById = (id: string) => httpClient.get(`/api/bill/${id}`);
export const getBillByOrderId = (orderId: string) => httpClient.get(`/api/bill/order/${orderId}`);
export const updateBillStatus = ({ id, status }: { id: string; status: string }) => httpClient.patch(`/api/bill/status/${id}`, { status });
