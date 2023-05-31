import { createSlice } from "@reduxjs/toolkit";

const PAGE_SIZE = 10;

const ordersSlice = createSlice({
    name: "orders",
    initialState: {
        userOrders: [],
        sellerOrders: [],
        needToFetch: {
            user: true,
            seller: true,
        },
        loading: {
            user: false,
            seller: false,
        },
        loadingMore: {
            user: false,
            seller: false,
        },
        error: {
            user: "",
            seller: "",
        },
        noMoreData: {
            user: false,
            seller: false,
        },
        fetchCounter: 0,
        userPage: 1,
        sellerPage: 1,
        totalCount: {
            user: 0,
            seller: 0,
        },
        userQuery: "",
        sellerQuery: "",
        addedOrdersCount: {
            user: 0,
            seller: 0,
        },
        PAGE_SIZE: {
            user: PAGE_SIZE,
            seller: PAGE_SIZE,
        },
    },
    reducers: {
        setOrders: (state, action) => {
            const { orders, type } = action.payload;

            state[`${type}Orders`] = orders;
            state.needToFetch[type] = false;
        },
        addSellerOrder: (state, action) => {
            const { sellerOrder } = action.payload;

            if (
                !state.sellerOrders.find((order) => order.id === sellerOrder.id)
            ) {
                state.sellerOrders = [sellerOrder, ...state.sellerOrders];
                // state.soundCounter += 1;
                state.addedOrdersCount["seller"] += 1;
            }
        },
        addUserOrder: (state, action) => {
            if (
                !state.userOrders.find(
                    (order) => order.id === action.payload.id
                )
            ) {
                state.userOrders = [action.payload, ...state.userOrders];
                state.addedOrdersCount["user"] += 1;
            }
        },
        setLoading: (state, action) => {
            const { value, type } = action.payload;

            state.loading[type] = value;

            if (value) {
                // value = true -> clear orders
                state[`${type}Orders`] = [];
            }
        },
        setLoadingMore: (state, action) => {
            const { loadingMore, type } = action.payload;

            state.loadingMore[type] = loadingMore;
        },
        setError: (state, action) => {
            const { error, type } = action.payload;

            state.error[type] = error;
        },
        setNoMoreData: (state, action) => {
            const { noMoreData, type } = action.payload;

            state.noMoreData[type] = noMoreData;
        },
        setFetchCounter: (state, action) => {
            state.fetchCounter = action.payload;
        },
        setNeedToFetch: (state, action) => {
            const { needToFetch, type } = action.payload;

            state.needToFetch[type] = needToFetch;
        },
        setPage: (state, action) => {
            const { page, type } = action.payload;

            state[`${type}Page`] = page;
        },
        setTotalCount: (state, action) => {
            const { count, type } = action.payload;

            state.totalCount[type] = count;
        },
        setQuery: (state, action) => {
            const { query, type } = action.payload;

            state[`${type}Query`] = query;
        },
        acknowledgeOrders: (state) => {
            state.sellerOrders = state.sellerOrders.map((sellerOrder) => {
                return { ...sellerOrder, isAcknowledged: true };
            });
        },
        updateOrder: (state, action) => {
            const { id, type, updateInfo } = action.payload;

            state[`${type}Orders`] = state[`${type}Orders`].map((order) => {
                if (order.id === id) {
                    return { ...order, ...updateInfo };
                }

                return order;
            });
        },
        deleteOrder: (state, action) => {
            const { id, type } = action.payload;

            state[`${type}Orders`] = state[`${type}Orders`].filter(
                (order) => order.id !== id
            );
            state.addedOrdersCount[type] -= 1;
            state.PAGE_SIZE[type] -= 1;
        },
        resetPageSize: (state, action) => {
            state.PAGE_SIZE[action.payload] = PAGE_SIZE;
        },
    },
});

export const {
    setOrders,
    addUserOrder,
    addSellerOrder,
    setLoading,
    setLoadingMore,
    setError,
    setNoMoreData,
    setFetchCounter,
    setPage,
    setNeedToFetch,
    setTotalCount,
    setQuery,
    acknowledgeOrders,
    updateOrder,
    deleteOrder,
    resetPageSize,
} = ordersSlice.actions;
export default ordersSlice.reducer;
