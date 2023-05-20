import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    createUserCart,
    getCartItems,
    setCartItem,
} from "../controllers/cart.controllers.js";

export const router = express.Router();

router.post("/", auth, createUserCart);

router.post(
    "/:productId",
    (request, response, next) => {
        request.select = {
            cart: {
                select: {
                    id: true,
                },
            },
        };
        auth(request, response, next);
    },
    setCartItem
);

router.get(
    "/",
    (request, response, next) => {
        request.select = {
            cart: {
                select: {
                    id: true,
                },
            },
        };
        auth(request, response, next);
    },
    getCartItems
);
