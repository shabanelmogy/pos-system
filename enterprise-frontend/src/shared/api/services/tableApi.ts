import { httpClient } from "@/shared/api/httpClient";

// Table Endpoints
export const addTable = (data: any) => httpClient.post("/api/table", data);
export const getTables = () => httpClient.get("/api/table");
export const updateTable = ({ tableId, ...tableData }: { tableId: string; [key: string]: any }) =>
  httpClient.put(`/api/table/${tableId}`, tableData);
export const deleteTable = (tableId: string) => httpClient.delete(`/api/table/${tableId}`);
