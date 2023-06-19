import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteRating,
    provideRating,
} from "../controllers/rating.controllers.js";
import { validateFeedback } from "../middleware/feedback.middleware.js";

export const ratingRouter = (io) => {
    const router = express.Router();

    router.post(
        "/:targetType/:targetId",
        (request, ...op) => {
            request.restrictStaff = true;
            auth(request, ...op);
        },
        (request, ...op) => {
            request.select = {
                rating: true,
                ratings: true,
            };
            validateFeedback(request, ...op);
        },
        (request, ...op) => {
            request.io = io;
            provideRating(request, ...op);
        }
    );

    router.delete("/:ratingId", auth, (request, ...op) => {
        request.io = io;
        deleteRating(request, ...op);
    });

    return router;
};
