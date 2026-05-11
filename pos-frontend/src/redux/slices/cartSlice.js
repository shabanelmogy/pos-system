import { createSlice } from "@reduxjs/toolkit";

const initialState = [];

const cartSlice = createSlice({
    name : "cart",
    initialState,
    reducers : {
        addItems : (state, action) => {
            state.push(action.payload);
        },

        removeItem: (state, action) => {
            return state.filter(item => item.id != action.payload);
        },

        updateQuantity: (state, action) => {
            const { id, quantity } = action.payload;
            const item = state.find(item => item.id === id);
            if (item) {
                item.quantity = quantity;
                item.price = item.pricePerQuantity * quantity;
            }
        },

        removeAllItems: (state) => {
            return [];
        },

        setCart: (state, action) => {
            return action.payload;
        }
    }
})

export const getTotalPrice = (state) => state.cart.reduce((total, item) => total + item.price, 0);
export const { addItems, removeItem, updateQuantity, removeAllItems, setCart } = cartSlice.actions;
export default cartSlice.reducer;