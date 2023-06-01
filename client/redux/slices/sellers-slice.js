import { createSlice } from "@reduxjs/toolkit";

export const sellersSlice = createSlice({
    name: "sellers",
    initialState: {
        sellers: [],
        activeFilter: "all",
        activeLocationType: "province",
        loading: false,
        loadingMore: false,
        error: "",
        needToFetch: true,
        totalCount: 0,
        fetchCounter: 0,
        query: "",
        page: 1,
        noMoreData: false,
        PAGE_SIZE: 15,
    },
    reducers: {
        setSellers: (state, action) => {
            state.sellers = action.payload;
            state.needToFetch = false;
        },
        setActiveFilter: (state, action) => {
            state.activeFilter = action.payload;
        },
        setActiveLocationType: (state, action) => {
            state.activeLocationType = action.payload;
        },
        setNeedToFetch: (state, action) => {
            state.needToFetch = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setLoadingMore: (state, action) => {
            state.loadingMore = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setTotalCount: (state, action) => {
            state.totalCount = action.payload;
        },
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setFetchCounter: (state, action) => {
            state.fetchCounter = action.payload;
        },
        setQuery: (state, action) => {
            state.query = action.payload;
        },
        setNoMoreData: (state, action) => {
            state.noMoreData = action.payload;
        },
        updateShop: (state, action) => {
            const { id, updateInfo } = action.payload;

            state.shops = state.shops.map((shop) => {
                if (shop.id === id) {
                    return { ...shop, ...updateInfo };
                }

                return shop;
            });
        },
    },
});

export default sellersSlice.reducer;
export const {
    setSellers,
    setActiveFilter,
    setActiveLocationType,
    setNeedToFetch,
    setLoading,
    setLoadingMore,
    setError,
    setTotalCount,
    setPage,
    setFetchCounter,
    setQuery,
    setNoMoreData,
    updateShop,
} = sellersSlice.actions;
