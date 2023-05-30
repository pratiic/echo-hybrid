import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteStore,
    getStoreDetails,
    getStores,
    registerStore,
} from "../controllers/store.controllers.js";

export const router = express.Router();

router.post("/", auth, registerStore);

router.get("/:storeId", auth, getStoreDetails);

router.get(
    "/",
    (request, ...op) => {
        request.select = {
            address: true,
        };
        auth(request, ...op);
    },
    getStores
);

router.delete("/", auth, deleteStore);
