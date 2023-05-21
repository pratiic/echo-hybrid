import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";

import authReducer from "./slices/auth-slice";
import themeReducer from "./slices/theme-slice";
import sidebarReducer from "./slices/sidebar-slice";
import filesReducer from "./slices/files-slices";
import categoriesReducer from "./slices/categories-slice";
import modalReducer from "./slices/modal-slice";
import alertsReducer from "./slices/alerts-slice";
import productsReducer from "./slices/products-slice";
import galleryReducer from "./slices/gallery-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    sidebar: sidebarReducer,
    files: filesReducer,
    categories: categoriesReducer,
    modal: modalReducer,
    alerts: alertsReducer,
    products: productsReducer,
    gallery: galleryReducer,
  },
  middleware: [logger],
});
