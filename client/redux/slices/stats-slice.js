import { createSlice } from "@reduxjs/toolkit";

const statsSlice = createSlice({
    name: "stats",
    initialState: {
        appStats: null,
        loading: true,
        error: "",
    },
    reducers: {
        setAppStats: (state, action) => {
            state.appStats = action.payload;
        },
        setProp: (state, action) => {
            const { prop, value } = action.payload;
            state[prop] = value;
        },
    },
});

export const { setAppStats, setProp } = statsSlice.actions;

export default statsSlice.reducer;
