import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
    deleteReview,
    getReviews,
    postReview,
} from "../controllers/review.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";
import { validateFeedback } from "../middleware/feedback.middleware.js";

export const reviewRouter = (io) => {
    const router = express.Router();

    router.post(
        "/:targetType/:targetId",
        (request, ...op) => {
            request.restrictStaff = true;
            auth(request, ...op);
        },
        getUpload().single("image"),
        (request, ...op) => {
            request.action = "review";
            validateFeedback(request, ...op);
        },
        (request, ...op) => {
            request.io = io;
            postReview(request, ...op);
        }
    );

    router.get("/:targetType/:targetId", auth, getReviews);

    router.delete("/:reviewId", auth, (request, ...op) => {
        request.io = io;
        deleteReview(request, ...op);
    });

    return router;
};
