import { createSlice } from "@reduxjs/toolkit";
import { setProp } from "../../lib/local-storage";

export const themeSlice = createSlice({
  name: "theme",
  initialState: {
    theme: "light",
  },
  reducers: {
    toggleTheme: (state, action) => {
      //if a theme is passed, set theme to it
      let theme;

      if (
        action.payload &&
        (action.payload === "light" || action.payload === "dark")
      ) {
        theme = action.payload;
      } else {
        theme = state.theme === "light" ? "dark" : "light";
      }

      state.theme = theme;
      setProp("theme", theme);
    },
  },
});

export default themeSlice.reducer;
export const { toggleTheme } = themeSlice.actions;
