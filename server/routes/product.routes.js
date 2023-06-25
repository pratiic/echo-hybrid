import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    addProductImages,
    deleteProduct,
    deleteProductImage,
    getProductDetails,
    getProducts,
    postProduct,
    // searchProducts,
    updateProduct,
} from "../controllers/product.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";
import { validateProduct } from "../middleware/product.middleware.js";

export const productRouter = (io) => {
    const router = express.Router();

    router.post(
        "/",
        (request, response, next) => {
            request.select = {
                store: {
                    select: {
                        id: true,
                        storeType: true,
                        business: {
                            select: {
                                id: true,
                                isVerified: true,
                            },
                        },
                        suspension: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
            };
            request.checkSellerSuspension = true;
            auth(request, response, next);
        },
        getUpload().array("images"),
        postProduct
    );

    router.get(
        "/",
        (request, response, next) => {
            request.select = {
                address: true,
                store: {
                    select: {
                        id: true,
                    },
                },
            };
            auth(request, response, next);
        },
        getProducts
    );

    // router.get(
    //     "/search/:query",
    //     (request, response, next) => {
    //         request.select = {
    //             address: true,
    //             store: {
    //                 select: {
    //                     id: true,
    //                 },
    //             },
    //         };
    //         auth(request, response, next);
    //     },
    //     searchProducts
    // );

    router.get("/:productId", auth, getProductDetails);

    router.patch(
        "/:productId",
        auth,
        (request, response, next) => {
            request.validateSeller = true;
            validateProduct(request, response, next);
        },
        updateProduct
    );

    router.patch(
        "/:productId/images",
        auth,
        getUpload().array("images"),
        (request, response, next) => {
            request.validateSeller = true;
            validateProduct(request, response, next);
        },
        addProductImages
    );

    router.delete(
        "/:productId/images",
        auth,
        (request, response, next) => {
            request.validateSeller = true;
            validateProduct(request, response, next);
        },
        deleteProductImage
    );

    router.delete(
        "/:productId",
        auth,
        (request, response, next) => {
            request.validateSeller = true;
            validateProduct(request, response, next);
        },
        (request, ...op) => {
            request.io = io;
            deleteProduct(request, ...op);
        }
    );

    return router;
};
