import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteRating,
    provideRating,
} from "../controllers/rating.controllers.js";

export const ratingRouter = (io) => {
    const router = express.Router();

    router.post("/:targetType/:targetId", auth, (request, ...op) => {
        request.io = io;
        provideRating(request, ...op);
    });

    router.delete("/:ratingId", auth, (request, ...op) => {
        request.io = io;
        deleteRating(request, ...op);
    });

    return router;
};
