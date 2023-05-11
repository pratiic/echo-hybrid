import { configureStore } from "@reduxjs/toolkit";
import logger from "redux-logger";

import authReducer from "./slices/auth-slice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: [logger],
});
