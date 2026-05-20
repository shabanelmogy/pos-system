import { httpClient } from "@/shared/api/httpClient";

// KDS Station Endpoints
export const getKitchenStations = (branchId?: string) => 
  httpClient.get("/api/kitchen-station", { params: { branchId } });

// KDS Order Endpoints
export const getActiveOrders = (stationId?: string) => 
  httpClient.get("/api/order", { params: { lifecycle: 'ACTIVE', kitchenStationId: stationId, includeItems: true } });

export const updateItemStatus = ({ orderId, itemId, status }: { orderId: string; itemId: string; status: string }) =>
  httpClient.patch(`/api/order/${orderId}/item/${itemId}/status`, { status });

export const updateOrderFulfillment = ({ orderId, status }: { orderId: string; status: string }) =>
  httpClient.patch(`/api/order/${orderId}/fulfillment`, { status });
