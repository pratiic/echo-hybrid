import { createSlice } from "@reduxjs/toolkit";

export const businessesSlice = createSlice({
    name: "businesses",
    initialState: {
        requests: [],
        needToFetch: true,
        loading: false,
        loadingMore: false,
        error: "",
        page: 1,
        noMoreData: false,
        totalCount: 0,
        addedRequestsCount: 0,
        PAGE_SIZE: 10,
    },
    reducers: {
        setBusinessesProp: (state, action) => {
            const { prop, value } = action.payload;
            state[prop] = value;

            if (prop === "error") {
                state.page -= 1;
            }

            if (prop === "requests") {
                state.needToFetch = false;
            }
        },
        addRequest: (state, action) => {
            if (
                !state.requests.find(
                    (request) => request.id === action.payload.id
                )
            ) {
                state.requests = [action.payload, ...state.requests];
                state.addedRequestsCount += 1;
            }
        },
        acknowledgeRequests: (state, action) => {
            state.requests = state.requests.map((request) => {
                return {
                    ...request,
                    isAcknowledged: true,
                };
            });
        },
        deleteRequest: (state, action) => {
            if (
                state.requests.find((request) => request.id === action.payload)
            ) {
                state.requests = state.requests.filter(
                    (request) => request.id !== action.payload
                );
                state.addedRequestsCount -= 1;
            }
        },
    },
});

export default businessesSlice.reducer;
export const {
    setBusinessesProp,
    addRequest,
    acknowledgeRequests,
    deleteRequest,
} = businessesSlice.actions;
