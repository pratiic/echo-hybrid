import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    checkOrderAbility,
    createUserCart,
    getCartItems,
    removeCartItem,
    setCartItem,
} from "../controllers/cart.controllers.js";

export const router = express.Router();

router.post(
    "/",
    (request, ...op) => {
        request.restrictStaff = true;
        auth(request, ...op);
    },
    createUserCart
);

router.post(
    "/:productId",
    (request, response, next) => {
        request.restrictStaff = true;
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
        request.restrictStaff = true;
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

router.delete(
    "/:itemId",
    (request, response, next) => {
        request.restrictStaff = true;
        request.select = {
            cart: {
                select: {
                    id: true,
                    items: {
                        select: {
                            id: true,
                        },
                    },
                },
            },
        };
        auth(request, response, next);
    },
    removeCartItem
);

router.get(
    "/checkout",
    (request, response, next) => {
        request.restrictStaff = true;
        request.select = {
            cart: {
                select: {
                    id: true,
                    items: {
                        select: {
                            id: true,
                            product: {
                                select: {
                                    id: true,
                                    isSecondHand: true,
                                    storeId: true,
                                    stock: {
                                        select: {
                                            id: true,
                                            quantity: true,
                                            variants: true,
                                        },
                                    },
                                    suspension: {
                                        select: {
                                            id: true,
                                        },
                                    },
                                    store: {
                                        select: {
                                            id: true,
                                            suspension: {
                                                select: {
                                                    id: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                            variant: true,
                            quantity: true,
                        },
                    },
                },
            },
        };
        auth(request, response, next);
    },
    checkOrderAbility
);
