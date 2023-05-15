import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    addCategories,
    controlCategoryRequest,
    deleteCategory,
    getCategories,
    requestCategory,
} from "../controllers/category.controllers.js";

export const router = express.Router();

router.post(
    "/",
    (request, response, next) => {
        request.validateAdmin = true;
        auth(request, response, next);
    },
    addCategories
);

router.get("/", getCategories);

router.post("/request", auth, requestCategory);

router.patch(
    "/request",
    (request, response, next) => {
        request.validateAdmin = true;
        auth(request, response, next);
    },
    controlCategoryRequest
);

router.delete(
    "/:categoryName",
    (request, response, next) => {
        request.validateAdmin = true;
        auth(request, response, next);
    },
    deleteCategory
);
