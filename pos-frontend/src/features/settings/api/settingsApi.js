import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// POS Settings Endpoints
export const getAllPosSettings = () => axiosWrapper.get("/api/pos-settings");
export const getPosSettings = (posPointId) => axiosWrapper.get(`/api/pos-settings/${posPointId}`);
export const updatePosSettings = (posPointId, data) => axiosWrapper.patch(`/api/pos-settings/${posPointId}`, data);
