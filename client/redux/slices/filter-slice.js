import { createSlice } from "@reduxjs/toolkit";

const options = {
    activeFilter: "all",
    locationFilter: "province",
    sortingType: "rating",
    orderType: "desc",
};

const productFilterSlice = createSlice({
    name: "filter",
    initialState: {
        ...options,
        sellerFilter: {
            ...options,
        },
    },
    reducers: {
        setFilterOptions: (state, action) => {
            const { activeFilter, locationFilter, sortingType, orderType } =
                action.payload.options;

            if (!action.payload.isGlobal) {
                // filter for seller products
                state.sellerFilter = { ...action.payload.options };
            } else {
                state.activeFilter = activeFilter;
                state.locationFilter = locationFilter;
                state.sortingType = sortingType;
                state.orderType = orderType;
            }
        },
        resetFilterOptions: (state, action) => {
            state.activeFilter = options.activeFilter;
            state.locationFilter = options.locationFilter;
            state.sortingType = options.sortingType;
            state.orderType = options.orderType;
        },
        resetSellerFilterOptions: (state, action) => {
            state.sellerFilter = options;
        },
    },
});

export const {
    setFilterOptions,
    resetFilterOptions,
    resetSellerFilterOptions,
} = productFilterSlice.actions;
export default productFilterSlice.reducer;
