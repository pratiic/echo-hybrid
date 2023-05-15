import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteBusiness,
    modifyBusinessStatus,
    requestRegistration,
    updateBusiness,
} from "../controllers/business.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";
import { validateBusiness } from "../middleware/business.middleware.js";

export const router = express.Router();

router.post("/", auth, getUpload().single("image"), requestRegistration);

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
