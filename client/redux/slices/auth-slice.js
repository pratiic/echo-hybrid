import { createSlice } from "@reduxjs/toolkit";
import { getProp, setProp } from "../../lib/local-storage";

export const authSlice = createSlice({
    name: "auth",
    initialState: {
        authUser: getProp("authUser"),
    },
    reducers: {
        setAuthUser: (state, action) => {
            state.authUser = action.payload;
            setProp("authUser", action.payload);
        },
    },
});

export default authSlice.reducer;
export const { setAuthUser } = authSlice.actions;
