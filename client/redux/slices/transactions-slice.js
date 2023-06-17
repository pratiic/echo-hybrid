import { createSlice } from "@reduxjs/toolkit";

const transactionsSlice = createSlice({
    name: "transactions",
    initialState: {
        userTransactions: [],
        sellerTransactions: [],
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
        soundCounter: 0,
        fetchCounter: 0,
        userPage: 1,
        sellerPage: 1,
        userQuery: "",
        sellerQuery: "",
        userDisplayPeriod: "all",
        sellerDisplayPeriod: "all",
        totalCount: {
            user: 0,
            seller: 0,
        },
        addedTransactionsCount: {
            user: 0,
            seller: 0,
        },
        PAGE_SIZE: {
            user: 10,
            seller: 10,
        },
    },
    reducers: {
        setTransactions: (state, action) => {
            const { transactions, type } = action.payload;

            state[`${type}Transactions`] = transactions;
            state.needToFetch[type] = false;
            state.loading[type] = false;
            state.error[type] = "";
        },
        deleteTransaction: (state, action) => {
            const { id, type } = action.payload;

            state[`${type}Transactions`] = state[`${type}Transactions`].filter(
                (transaction) => transaction.id !== id
            );
            state.addedTransactionsCount[type] -= 1;
            state.PAGE_SIZE[type] -= 1;
        },
        addTransaction: (state, action) => {
            const { transaction, type, playSound } = action.payload;

            if (
                !state[`${type}Transactions`].find(
                    (tr) => tr.id === transaction.id
                )
            ) {
                state[`${type}Transactions`] = [
                    transaction,
                    ...state[`${type}Transactions`],
                ];

                state.addedTransactionsCount[type] += 1;

                if (playSound) {
                    state.soundCounter += 1;
                }
            }
        },
        setLoading: (state, action) => {
            const { value, type } = action.payload;

            state.loading[type] = value;

            if (value) {
                // value = true -> clear transactions
                state[`${type}Transactions`] = [];
            }
        },
        setLoadingMore: (state, action) => {
            const { loadingMore, type } = action.payload;

            state.loadingMore[type] = loadingMore;
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
        setQuery: (state, action) => {
            const { query, type } = action.payload;

            state[`${type}Query`] = query;
        },
        setError: (state, action) => {
            const { error, type } = action.payload;

            state.error[type] = error;
        },
        setTotalCount: (state, action) => {
            const { count, type } = action.payload;

            state.totalCount[type] = count;
        },
        acknowledgeTransactions: (state, action) => {
            const { type } = action.payload;

            state[`${type}Transactions`] = state[`${type}Transactions`].map(
                (transaction) => {
                    return {
                        ...transaction,
                        isAcknowledged: true,
                    };
                }
            );
        },
        setDisplayPeriod: (state, action) => {
            const { type, period } = action.payload;

            state[`${type}DisplayPeriod`] = period;
        },
        resetPageSize: (state, action) => {
            state.PAGE_SIZE[action.payload] = 10;
        },
    },
});

export const {
    setTransactions,
    deleteTransaction,
    addTransaction,
    setLoading,
    setLoadingMore,
    setFetchCounter,
    setNeedToFetch,
    setPage,
    setNoMoreData,
    setError,
    setQuery,
    setDisplayPeriod,
    setTotalCount,
    acknowledgeTransactions,
    resetPageSize,
} = transactionsSlice.actions;

export default transactionsSlice.reducer;
