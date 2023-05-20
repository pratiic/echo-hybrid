import { createSlice } from "@reduxjs/toolkit";

export const productsSlice = createSlice({
    name: "products",
    initialState: {
        activeProduct: null,
    },
    reducers: {
        setActiveProduct: (state, action) => {
            state.activeProduct = action.payload;
        },
    },
});

export const { setActiveProduct } = productsSlice.actions;

export default productsSlice.reducer;
