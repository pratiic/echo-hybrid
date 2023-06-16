import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    acknowledgeRequests,
    addCategories,
    controlCategoryRequest,
    deleteCategory,
    getCategories,
    getCategoryRequests,
    requestCategory,
} from "../controllers/category.controllers.js";

export const categoryRouter = (io) => {
    const router = express.Router();

    router.post(
        "/",
        (request, response, next) => {
            request.validateAdmin = true;
            auth(request, response, next);
        },
        addCategories
    );

    router.get("/", getCategories);

    router.post(
        "/requests",
        (request, ...op) => {
            request.restrictStaff = true;
            auth(request, ...op);
        },
        (request, ...op) => {
            request.io = io;
            requestCategory(request, ...op);
        }
    );

    router.patch(
        "/requests",
        (request, response, next) => {
            request.io = io;
            request.validateAdmin = true;
            auth(request, response, next);
        },
        controlCategoryRequest
    );

    router.patch(
        "/requests/acknowledge",
        (request, response, next) => {
            request.validateAdmin = true;
            auth(request, response, next);
        },
        acknowledgeRequests
    );

    router.get(
        "/requests",
        (request, response, next) => {
            request.validateAdmin = true;
            auth(request, response, next);
        },
        getCategoryRequests
    );

    router.delete(
        "/:categoryName",
        (request, response, next) => {
            request.validateAdmin = true;
            auth(request, response, next);
        },
        deleteCategory
    );

    return router;
};
