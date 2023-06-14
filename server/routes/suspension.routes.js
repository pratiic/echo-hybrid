import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    controlSuspension,
    getSuspensions,
} from "../controllers/suspension.controllers.js";

export const suspensionRouter = (io) => {
    const router = express.Router();

    router.post(
        "/:targetType/:targetId",
        (request, ...op) => {
            request.io = io;
            request.validateAdmin = true;
            auth(request, ...op);
        },
        controlSuspension
    );

    router.get(
        "/",
        (request, ...op) => {
            request.validateAdmin = true;
            auth(request, ...op);
        },
        getSuspensions
    );

    return router;
};
