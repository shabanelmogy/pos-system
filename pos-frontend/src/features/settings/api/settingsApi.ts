import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// POS Settings Endpoints
export const getAllPosSettings = () => axiosWrapper.get<any[]>("/api/pos-settings");
export const getPosSettings = (posPointId: string) => axiosWrapper.get<any>(`/api/pos-settings/${posPointId}`);
export const updatePosSettings = (posPointId: string, data: any) => axiosWrapper.patch<any>(`/api/pos-settings/${posPointId}`, data);
