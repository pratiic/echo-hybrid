import { createSlice } from "@reduxjs/toolkit";

export const productsSlice = createSlice({
  name: "products",
  initialState: {
    products: [],
    activeProduct: null,
    needToFetch: true,
    page: 1,
    fetchCounter: 1,
    query: "",
    category: "",
    loading: false,
    loadingMore: false,
    noMoreData: false,
    error: "",
    totalCount: 0,
    PAGE_SIZE: 15,
  },
  reducers: {
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setActiveProduct: (state, action) => {
      state.activeProduct = action.payload;
    },
    updateActiveProduct: (state, action) => {
      state.activeProduct = { ...state.activeProduct, ...action.payload };

      state.products = state.products.map((product) => {
        if (product.id === state.activeProduct?.id) {
          return {
            ...product,
            ...action.payload,
          };
        }

        return product;
      });
    },
    setNeedToFetch: (state, action) => {
      state.needToFetch = action.paylaod;
    },
    setPage: (state, action) => {
      state.page = action.paylaod;
    },
    setFetchCounter: (state, action) => {
      state.fetchCounter = action.paylaod;
    },
    setQuery: (state, action) => {
      state.query = action.payload;
    },
    setCategory: (state, action) => {
      state.category = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setLoadingMore: (state, action) => {
      state.loadingMore = action.payload;
    },
    setNoMoreData: (state, action) => {
      state.noMoreData = action.payload;
    },
    setTotalCount: (state, action) => {
      state.totalCount = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    deleteProduct: (state, action) => {
      state.products = state.products.filter(
        (product) => product.id !== action.payload
      );
    },
  },
});

export const {
  setProduct,
  setActiveProduct,
  updateActiveProduct,
  setNeedToFecth,
  setPage,
  setFetchCounter,
  setQuery,
  setCategory,
  setLoading,
  setLoadingMore,
  setNoMoreData,
  setTotalCount,
  setError,
  deleteProduct,
} = productsSlice.actions;

export default productsSlice.reducer;
