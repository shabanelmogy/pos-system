import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    id: "",
    name: "",
    email : "",
    phone: "",
    role: "",
    branchId: null,
    posPermissions: [],
    isAuth: false
}

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            const { id, name, phone, email, role, branchId, posPermissions } = action.payload;
            state.id = id;
            state.name = name;
            state.phone = phone;
            state.email = email;
            state.role = role;
            state.branchId = branchId;
            state.posPermissions = posPermissions || [];
            state.isAuth = true;
        },

        removeUser: (state) => {
            state.id = "";
            state.email = "";
            state.name = "";
            state.phone = "";
            state.role = "";
            state.branchId = null;
            state.posPermissions = [];
            state.isAuth = false;
        }
    }
})

export const { setUser, removeUser } = userSlice.actions;
export default userSlice.reducer;