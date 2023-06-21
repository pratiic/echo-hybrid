import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    acknowledgeReports,
    deleteReport,
    getReports,
    reportTarget,
} from "../controllers/report.controllers.js";

export const reportRouter = (io) => {
    const router = express.Router();

    router.post(
        "/:targetType/:targetId",
        (request, ...op) => {
            request.io = io;
            request.restrictStaff = true;
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

    router.delete(
        "/:reportId",
        (request, ...op) => {
            request.validateAdmin = true;
            auth(request, ...op);
        },
        deleteReport
    );

    router.patch(
        "/acknowledge",
        (request, ...op) => {
            request.validateAdmin = true;
            auth(request, ...op);
        },
        acknowledgeReports
    );

    return router;
};
