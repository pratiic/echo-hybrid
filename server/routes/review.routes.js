import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
    deleteReview,
    getReviews,
    postReview,
} from "../controllers/review.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";

export const router = express.Router();

router.post(
    "/:targetType/:targetId",
    auth,
    getUpload().single("image"),
    postReview
);

router.get("/:targetType/:targetId", auth, getReviews);

router.delete("/:reviewId", auth, deleteReview);
