import { createSlice } from "@reduxjs/toolkit";

export const cartSlice = createSlice({
    name: "cart",
    initialState: {
        items: [],
        loading: false,
        error: "",
        needToFetch: true,
    },
    reducers: {
        setCartItems: (state, action) => {
            state.items = action.payload;
            state.needToFetch = false;
        },
        addCartItem: (state, action) => {
            if (!state.items.find((item) => item.id === action.payload.id)) {
                state.items = [action.payload, ...state.items];
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
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },

        setError: (state, action) => {
            state.error = action.payload;
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
    setError,
    setNeedToFetch,
} = cartSlice.actions;
