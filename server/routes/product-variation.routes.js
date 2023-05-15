import express from "express";
import auth from "../middleware/auth.middleware.js";
import { setProductVariations } from "../controllers/product-variation.controllers.js";
import { validateProduct } from "../middleware/product.middleware.js";

export const router = express.Router();

router.post(
    "/:productId",
    auth,
    (request, response, next) => {
        request.validateSeller = true;
        request.inclusionFields = {
            variations: true,
        };
        validateProduct(request, response, next);
    },
    setProductVariations
);
