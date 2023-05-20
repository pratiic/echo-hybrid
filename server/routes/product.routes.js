import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    addProductImages,
    deleteProduct,
    deleteProductImage,
    postProduct,
    updateProduct,
} from "../controllers/product.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";
import { validateProduct } from "../middleware/product.middleware.js";

export const router = express.Router();

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
                        },
                    },
                },
            },
        };
        auth(request, response, next);
    },
    getUpload().array("images"),
    postProduct
);

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
    deleteProduct
);
