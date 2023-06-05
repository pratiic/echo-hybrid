import express from "express";

import auth from "../middleware/auth.middleware.js";
import { signUserUp } from "../controllers/auth.controllers.js";
import {
    acknowledgeDeliveries,
    deleteDelivery,
    getDeliveries,
} from "../controllers/delivery.controllers.js";

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

    router.get(
        "/",
        (request, ...op) => {
            request.validateDeliveryPersonnel = true;
            auth(request, ...op);
        },
        getDeliveries
    );

    router.delete(
        "/:deliveryId",
        (request, ...op) => {
            request.validateDeliveryPersonnel = true;
            auth(request, ...op);
        },
        deleteDelivery
    );

    router.patch("/", auth, acknowledgeDeliveries);

    return router;
};
