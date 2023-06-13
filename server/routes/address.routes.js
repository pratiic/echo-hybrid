import express from "express";

import auth from "../middleware/auth.middleware.js";
import { setAddress } from "../controllers/address.controllers.js";

export const addressRouter = (io) => {
    const router = express.Router();

    router.post(
        "/:targetType",
        (request, response, next) => {
            request.io = io;
            request.select = {
                store: {
                    select: {
                        id: true,
                        storeType: true,
                        business: {
                            select: {
                                id: true,
                                address: true,
                            },
                        },
                    },
                },
                address: true,
            };
            auth(request, response, next);
        },
        setAddress
    );

    return router;
};
