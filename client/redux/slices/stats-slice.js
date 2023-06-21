import { createSlice } from "@reduxjs/toolkit";

const statsSlice = createSlice({
  name: "stats",
  initialState: {
    appStats: null,
  },
  reducers: {
    setAppStats: (state, action) => {
      state.appStats = action.payload;
    },
  },
});

export const { setAppStats } = statsSlice.actions;

export default statsSlice.reducer;
