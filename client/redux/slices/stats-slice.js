import { createSlice } from "@reduxjs/toolkit";

const statsSlice = createSlice({
    name: "stats",
    initialState: {
        appStats: {},
        needToFetch: true,
    },
    reducers: {
        setAppStats: (state, action) => {
            state.appStats = action.payload;

            state.needToFetch = false;
        },
    },
});

export const {
    setAppStats,
    updateAppStats,
    setNeedToFetch,
} = statsSlice.actions;

export default statsSlice.reducer;
