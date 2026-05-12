import { axiosWrapper } from "../../../shared/api/axiosWrapper";

// Customer Endpoints
export const getCustomers = () => axiosWrapper.get("/api/customer");
export const getCustomerById = (id) => axiosWrapper.get(`/api/customer/${id}`);
export const addCustomer = (data) => axiosWrapper.post("/api/customer", data);
export const updateCustomer = ({ id, ...data }) => axiosWrapper.put(`/api/customer/${id}`, data);
