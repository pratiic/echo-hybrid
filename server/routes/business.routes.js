import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteBusiness,
    getBusinessDetails,
    modifyBusinessStatus,
    registerBusiness,
    updateBusiness,
} from "../controllers/business.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";
import { validateBusiness } from "../middleware/business.middleware.js";

export const router = express.Router();

router.post("/", auth, getUpload().single("image"), registerBusiness);

router.get(
    "/:businessId",
    (request, response, next) => {
        request.include = {
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
    "/:businessId/status",
    auth,
    (request, response, next) => {
        request.selectionFilter = {
            address: {
                select: {
                    id: true,
                },
            },
        };
        validateBusiness(request, response, next);
    },
    modifyBusinessStatus
);

router.delete("/:businessId", auth, validateBusiness, deleteBusiness);
