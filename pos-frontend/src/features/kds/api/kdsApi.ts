import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// KDS Station Endpoints
export const getKitchenStations = (branchId?: string) => 
  axiosWrapper.get("/api/kitchen-station", { params: { branchId } });

// KDS Order Endpoints
export const getActiveOrders = (stationId?: string) => 
  axiosWrapper.get("/api/order", { params: { lifecycle: 'ACTIVE', kitchenStationId: stationId, includeItems: true } });

export const updateItemStatus = ({ orderId, itemId, status }: { orderId: string; itemId: string; status: string }) =>
  axiosWrapper.patch(`/api/order/${orderId}/item/${itemId}/status`, { status });

export const updateOrderFulfillment = ({ orderId, status }: { orderId: string; status: string }) =>
  axiosWrapper.patch(`/api/order/${orderId}/fulfillment`, { status });
