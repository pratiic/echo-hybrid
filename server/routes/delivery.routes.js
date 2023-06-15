import express from "express";

import auth from "../middleware/auth.middleware.js";
import { signUserUp } from "../controllers/auth.controllers.js";
import {
    acknowledgeDeliveries,
    deleteDelivery,
    deleteDeliveryPersonnel,
    getDeliveries,
    getDeliveryPersonnel,
} from "../controllers/delivery.controllers.js";

export const deliveryRouter = (io) => {
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

    router.get(
        "/personnel",
        (request, ...op) => {
            request.validateAdmin = true;
            auth(request, ...op);
        },
        getDeliveryPersonnel
    );

    router.delete(
        "/personnel/:personnelId",
        (request, ...op) => {
            request.io = io;
            request.validateAdmin = true;
            auth(request, ...op);
        },
        deleteDeliveryPersonnel
    );

    return router;
};
