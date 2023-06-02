import express from "express";

import auth from "../middleware/auth.middleware.js";
import { signUserUp } from "../controllers/auth.controllers.js";

export const deliveryRouter = () => {
    const router = express.Router();

    router.post(
        "/personnel",
        (request, ...op) => {
            request.validateAdmin = true;
            auth(request, ...op);
        },
        (request, ...op) => {
            request.isDeliveryPersonnel = true;
            signUserUp(request, ...op);
        }
    );

    return router;
};
