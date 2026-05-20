import { httpClient } from "@/shared/api/httpClient";

// POS Settings Endpoints
export const getAllPosSettings = () => httpClient.get<any[]>("/api/pos-settings");
export const getPosSettings = (posPointId: string) => httpClient.get<any>(`/api/pos-settings/${posPointId}`);
export const updatePosSettings = (posPointId: string, data: any) => httpClient.patch<any>(`/api/pos-settings/${posPointId}`, data);
