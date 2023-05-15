import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";

import authReducer from "./slices/auth-slice";
import themeReducer from "./slices/theme-slice";
import sidebarReducer from "./slices/sidebar-slice";
import filesReducer from "./slices/files-slices";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    sidebar: sidebarReducer,
    files: filesReducer,
  },
  middleware: [logger],
});
