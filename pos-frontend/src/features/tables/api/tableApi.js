import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// Table Endpoints
export const addTable = (data) => axiosWrapper.post("/api/table", data);
export const getTables = () => axiosWrapper.get("/api/table");
export const updateTable = ({ tableId, ...tableData }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);
export const deleteTable = (tableId) => axiosWrapper.delete(`/api/table/${tableId}`);
