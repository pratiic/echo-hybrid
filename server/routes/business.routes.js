import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    controlBusinessRegistration,
    deleteBusiness,
    getBusinessDetails,
    getBusinessRequests,
    registerBusiness,
    updateBusiness,
} from "../controllers/business.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";
import { validateBusiness } from "../middleware/business.middleware.js";

export const businessRouter = (io) => {
    const router = express.Router();

    router.post("/", auth, getUpload().single("image"), registerBusiness);

    router.get(
        "/:businessId/details",
        (request, response, next) => {
            request.select = {
                store: {
                    select: {
                        id: true,
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
        getBusinessDetails
    );

    router.get(
        "/requests",
        (request, ...op) => {
            request.validateAdmin = true;
            auth(request, ...op);
        },
        getBusinessRequests
    );

    router.patch(
        "/:businessId",
        auth,
        (request, response, next) => {
            request.selectionFilter = {
                name: true,
                ownerName: true,
                PAN: true,
                phone: true,
            };
            validateBusiness(request, response, next);
        },
        updateBusiness
    );

    router.patch(
        "/registration/:businessId",
        (request, ...op) => {
            request.validateAdmin = true;
            request.io = io;
            auth(request, ...op);
        },
        (request, ...op) => {
            request.selectionFilter = {
                isVerified: true,
                address: true,
                store: {
                    select: {
                        id: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                            },
                        },
                    },
                },
            };
            validateBusiness(request, ...op);
        },
        controlBusinessRegistration
    );

    router.delete(
        "/:businessId",
        auth,
        (request, ...op) => {
            request.io = io;
            request.selectionFilter = {
                isVerified: true,
            };
            validateBusiness(request, ...op);
        },
        deleteBusiness
    );

    return router;
};
