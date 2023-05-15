import express from "express";

import auth from "../middleware/auth.middleware.js";
import { validateProduct } from "../middleware/product.middleware.js";
import { setStock } from "../controllers/stock.controllers.js";

export const router = express.Router();

router.post(
    "/:productId",
    auth,
    (request, response, next) => {
        request.validateSeller = true;
        request.inclusionFields = {
            variations: true,
            stock: true,
        };
        validateProduct(request, response, next);
    },
    setStock
);
