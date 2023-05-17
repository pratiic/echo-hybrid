import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    controlOrder,
    deleteOrder,
    placeOrder,
} from "../controllers/order.controllers.js";
import { validateOrder } from "../middleware/order.middleware.js";

export const router = express.Router();

router.post("/:productId", auth, placeOrder);

router.patch(
    "/:orderId",
    auth,
    (request, response, next) => {
        request.select = {
            id: true,
            status: true,
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
    controlOrder
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
