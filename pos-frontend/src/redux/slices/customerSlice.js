import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    orderId: "",
    customerName: "",
    customerPhone: "",
    guests: 0,
    table: null
}


const customerSlice = createSlice({
    name : "customer",
    initialState,
    reducers : {
        setCustomer: (state, action) => {
            const { name, phone, guests } = action.payload;
            state.orderId = 'new-' + Date.now();
            state.customerName = name;
            state.customerPhone = phone;
            state.guests = guests;
            state.table = null; // Always reset table when starting new customer
        },

        removeCustomer: (state) => {
            state.customerName = "";
            state.customerPhone = "";
            state.guests = 0;
            state.table = null;
            state.orderId = "";
        },

        updateTable: (state, action) => {
            state.table = action.payload.table;
        },

        setOrder: (state, action) => {
            const { customerName, customerPhone, table, orderId, guests } = action.payload;
            state.customerName = customerName;
            state.customerPhone = customerPhone;
            state.table = table;
            state.orderId = orderId;
            state.guests = guests;
        }

    }
})


export const { setCustomer, removeCustomer, updateTable, setOrder } = customerSlice.actions;
export default customerSlice.reducer;