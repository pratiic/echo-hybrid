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
        updateAuthUser: (state, action) => {
            state.authUser = {
                ...state.authUser,
                ...action.payload,
            };
            setProp("authUser", state.authUser);
        },
        signUserOut: (state, action) => {
            state.authUser = null;
            setProp(null);
            setProp("theme", "light");
            location.reload();
        },
    },
});

export default authSlice.reducer;
export const { setAuthUser, updateAuthUser, signUserOut } = authSlice.actions;
