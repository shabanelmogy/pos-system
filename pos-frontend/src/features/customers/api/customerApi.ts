import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// Customer Endpoints
export const getCustomers = () => axiosWrapper.get("/api/customer");
export const getCustomerById = (id: string) => axiosWrapper.get(`/api/customer/${id}`);
export const addCustomer = (data: any) => axiosWrapper.post("/api/customer", data);
export const updateCustomer = ({ id, ...data }: { id: string; [key: string]: any }) => axiosWrapper.put(`/api/customer/${id}`, data);
