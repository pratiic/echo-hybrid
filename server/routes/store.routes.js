import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteStore,
    getStoreDetails,
    getStores,
    registerStore,
} from "../controllers/store.controllers.js";

export const storeRouter = (io) => {
    const router = express.Router();

    router.post(
        "/",
        (request, ...op) => {
            request.restrictStaff = true;
            auth(request, ...op);
        },
        registerStore
    );

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

    router.delete(
        "/",
        (request, ...op) => {
            request.select = {
                store: {
                    select: {
                        id: true,
                        business: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
            };
            auth(request, ...op);
        },
        (request, ...op) => {
            request.io = io;
            deleteStore(request, ...op);
        }
    );

    return router;
};
