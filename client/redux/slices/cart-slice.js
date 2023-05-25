import { createSlice } from "@reduxjs/toolkit";

export const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        loading: false,
        loadingMore: false,
        error: false,
        page: 1,
        noMoreData: false,
        needToFetch: true,
        totalCount: 0,
        addedItemsCount: 0,
        PAGE_SIZE: 5,
    },
    reducers: {
        setCartItems: (state, action) => {
            state.items = action.payload;
        },
        addCartItem: (state, action) => {
            if (!state.items.find((item) => item.id === action.payload.id)) {
                state.items = [action.payload, ...state.items];
                state.addedItemsCount += 1;
            }
        },
        updateCartItem: (state, action) => {
            const { id, updateInfo } = action.payload;

            state.items = state.items.map((item) => {
                if (item.id === id) {
                    return { ...item, ...updateInfo };
                }

                return item;
            });
        },
        deleteCartItem: (state, action) => {
            state.items = state.items.filter(
                (item) => parseInt(item.id) !== parseInt(action.payload)
            );
            state.PAGE_SIZE -= 1;
            state.totalCount -= 1;
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
        setPage: (state, action) => {
            state.page = action.payload;
        },
        setNoMoreData: (state, action) => {
            state.noMoreData = action.payload;
        },
        setNeedToFetch: (state, action) => {
            state.needToFetch = action.payload;
        },
        setTotalCount: (state, action) => {
            state.totalCount = action.payload;
        },
        resetPageCount: (state, action) => {
            state.PAGE_SIZE = 5;
        },
    },
});

export default cartSlice.reducer;
export const {
    setCartItems,
    addCartItem,
    updateCartItem,
    deleteCartItem,
    setLoading,
    setLoadingMore,
    setError,
    setPage,
    setNoMoreData,
    setNeedToFetch,
    setTotalCount,
    resetPageCount,
} = cartSlice.actions;
