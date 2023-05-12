import express from "express";

import auth from "../middleware/auth.middleware.js";
import { postProduct } from "../controllers/product.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";

export const router = express.Router();

router.post(
    "/",
    (request, response, next) => {
        request.include = {
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
