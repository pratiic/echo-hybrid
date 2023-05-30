import { createSlice } from "@reduxjs/toolkit";

export const sellersSlice = createSlice({
    name: "sellers",
    initialState: {
        sellers: [],
        activeFilter: "all",
        activeLocationType: "province",
        loading: false,
        error: "",
        needToFetch: true,
        totalCount: 0,
    },
    reducers: {
        setSellers: (state, action) => {
            state.sellers = action.payload;
            state.needToFetch = false;
        },
        setActiveFilter: (state, action) => {
            state.activeFilter = action.payload;
            state.needToFetch = true;
        },
        setActiveLocationType: (state, action) => {
            state.activeLocationType = action.payload;
            state.needToFetch = true;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setTotalCount: (state, action) => {
            state.totalCount = action.payload;
        },
    },
});

export default sellersSlice.reducer;
export const {
    setSellers,
    setActiveFilter,
    setActiveLocationType,
    setLoading,
    setError,
    setTotalCount,
} = sellersSlice.actions;
