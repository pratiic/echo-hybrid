import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    acknowledgeOrders,
    controlOrder,
    deleteOrder,
    getOrders,
    placeOrder,
} from "../controllers/order.controllers.js";
import { validateOrder } from "../middleware/order.middleware.js";

export const orderRouter = (io) => {
    const router = express.Router();

    router.post(
        "/:productId",
        (request, ...op) => {
            request.select = {
                cart: {
                    select: {
                        id: true,
                    },
                },
            };
            auth(request, ...op);
        },
        (request, ...op) => {
            request.io = io;
            placeOrder(request, ...op);
        }
    );

    router.get(
        "",
        (request, response, next) => {
            request.select = {
                store: {
                    select: {
                        id: true,
                    },
                },
            };

            auth(request, response, next);
        },
        getOrders
    );

    router.patch(
        "/acknowledge",
        (request, ...op) => {
            request.select = {
                store: {
                    select: {
                        id: true,
                    },
                },
            };
            auth(request, ...op);
        },
        acknowledgeOrders
    );

    router.patch(
        "/:orderId",
        auth,
        (request, response, next) => {
            request.select = {
                id: true,
                status: true,
                quantity: true,
                variant: true,
                store: {
                    select: {
                        id: true,
                        userId: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        isSecondHand: true,
                        stock: true,
                    },
                },
                origin: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            };
            validateOrder(request, response, next);
        },
        (request, ...op) => {
            request.io = io;
            controlOrder(request, ...op);
        }
    );

    router.delete(
        "/:orderId",
        auth,
        (request, response, next) => {
            request.select = {
                id: true,
                status: true,
                originId: true,
                store: {
                    select: {
                        id: true,
                        userId: true,
                    },
                },
            };
            validateOrder(request, response, next);
        },
        deleteOrder
    );

    return router;
};
