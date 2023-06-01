import express from "express";

import auth from "../middleware/auth.middleware.js";
import { getAppStats } from "../controllers/stat.controllers.js";

export const statRouter = () => {
    const router = express.Router();

    router.get(
        "/",
        (request, ...op) => {
            request.validateAdmin = true;
            auth(request, ...op);
        },
        getAppStats
    );

    return router;
};
