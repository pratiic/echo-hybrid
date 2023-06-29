import { createSlice } from "@reduxjs/toolkit";

export const categoriesSlice = createSlice({
    name: "categories",
    initialState: {
        categories: [],
        needToFetch: true,
        requests: {
            list: [],
            needToFetch: true,
            loading: false,
            error: false,
        },
    },
    reducers: {
        setCategories: (state, action) => {
            state.categories = action.payload;
            state.needToFetch = false;
        },
        setNeedToFetch: (state, action) => {
            state.needToFetch = action.payload;
        },
        setRequestsProp: (state, action) => {
            const { prop, value } = action.payload;

            state.requests[prop] = value;

            if (prop === "list") {
                state.requests.needToFetch = false;
            }
        },
        addCategoryRequest: (state, action) => {
            if (
                !state.requests.list.find(
                    (request) => request.name === action.payload.name
                )
            ) {
                state.requests.list = [...state.requests.list, action.payload];
            }
        },
        acknowledgeCategoryRequests: (state, action) => {
            state.requests.list = state.requests.list.map((request) => {
                return {
                    ...request,
                    isAcknowledged: true,
                };
            });
        },
        deleteCategoryRequest: (state, action) => {
            const categoryName = action.payload.toLowerCase().trim();

            state.requests.list = state.requests.list.filter(
                (request) => request.name !== categoryName
            );
        },
    },
});

export default categoriesSlice.reducer;
export const {
    setCategories,
    setNeedToFetch,
    setRequestsProp,
    addCategoryRequest,
    acknowledgeCategoryRequests,
    deleteCategoryRequest,
} = categoriesSlice.actions;
