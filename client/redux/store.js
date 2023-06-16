import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";

import authReducer from "./slices/auth-slice";
import themeReducer from "./slices/theme-slice";
import sidebarReducer from "./slices/sidebar-slice";
import filesReducer from "./slices/files-slice";
import categoriesReducer from "./slices/categories-slice";
import modalReducer from "./slices/modal-slice";
import alertsReducer from "./slices/alerts-slice";
import productsReducer from "./slices/products-slice";
import galleryReducer from "./slices/gallery-slice";
import filterReducer from "./slices/filter-slice";
import commentsReducer from "./slices/comments-slice";
import cartReducer from "./slices/cart-slice";
import notificationsReducer from "./slices/notifications-slice";
import chatReducer from "./slices/chat-slice";
import sellersReducer from "./slices/sellers-slice";
import ordersReducer from "./slices/orders-slice";
import deliveryReducer from "./slices/delivery-slice";
import businessesReducer from "./slices/businesses-slice";
import reportsReducer from "./slices/reports-slice";
import transactionsReducer from "./slices/transactions-slice";

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
    filter: filterReducer,
    comments: commentsReducer,
    cart: cartReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
    sellers: sellersReducer,
    orders: ordersReducer,
    delivery: deliveryReducer,
    businesses: businessesReducer,
    reports: reportsReducer,
    transactions: transactionsReducer,
  },
  middleware: [logger],
});
