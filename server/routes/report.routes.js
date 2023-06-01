import express from "express";

import auth from "../middleware/auth.middleware.js";
import { getReports, reportTarget } from "../controllers/report.controllers.js";

export const reportRouter = () => {
    const router = express.Router();

    router.post(
        "/:targetType/:targetId",
        (request, ...op) => {
            request.select = {
                store: {
                    select: {
                        id: true,
                    },
                },
            };
            auth(request, ...op);
        },
        reportTarget
    );

    router.get(
        "/",
        (request, ...op) => {
            request.validateAdmin = true;
            auth(request, ...op);
        },
        getReports
    );

    return router;
};
