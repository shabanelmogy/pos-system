import { httpClient } from "@/shared/api/httpClient";

// Customer Endpoints
export const getCustomers = () => httpClient.get("/api/customer");
export const getCustomerById = (id: string) => httpClient.get(`/api/customer/${id}`);
export const addCustomer = (data: any) => httpClient.post("/api/customer", data);
export const updateCustomer = ({ id, ...data }: { id: string; [key: string]: any }) => httpClient.put(`/api/customer/${id}`, data);
