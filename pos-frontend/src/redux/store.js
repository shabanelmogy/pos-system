import { configureStore } from "@reduxjs/toolkit";
import customerSlice from "../features/customers/store/customerSlice"
import cartSlice from "../features/pos/store/cartSlice";
import userSlice from "../features/auth/store/userSlice";
import posSlice from "../features/pos/store/posSlice";
import themeSlice from "../shared/store/themeSlice";
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
