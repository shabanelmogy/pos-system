import { configureStore } from "@reduxjs/toolkit";
import customerSlice from "./slices/customerSlice"
import cartSlice from "./slices/cartSlice";
import userSlice from "./slices/userSlice";
import posSlice from "./slices/posSlice";
import themeSlice from "./slices/themeSlice";
import { loadState, saveState } from "./persist";

const persistedCustomer = loadState("customer");
const persistedCart = loadState("cart");

const store = configureStore({
    reducer: {
        customer: customerSlice,
        cart : cartSlice,
        user : userSlice,
        pos  : posSlice,
        theme: themeSlice
    },
    preloadedState: {
        customer: persistedCustomer,
        cart: persistedCart
    },
    devTools: import.meta.env.NODE_ENV !== "production",
});

store.subscribe(() => {
    saveState("customer", store.getState().customer);
    saveState("cart", store.getState().cart);
});

export default store;
