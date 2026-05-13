import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// Table Endpoints
export const addTable = (data: any) => axiosWrapper.post("/api/table", data);
export const getTables = () => axiosWrapper.get("/api/table");
export const updateTable = ({ tableId, ...tableData }: { tableId: string; [key: string]: any }) =>
  axiosWrapper.put(`/api/table/${tableId}`, tableData);
export const deleteTable = (tableId: string) => axiosWrapper.delete(`/api/table/${tableId}`);
