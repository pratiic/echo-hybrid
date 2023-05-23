import express from "express";
import auth from "../middleware/auth.middleware.js";
import { getReplies, replyToReview } from "../controllers/reply.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";

export const router = express.Router();

router.post("/:reviewId", auth, getUpload().single("image"), replyToReview);

router.get("/:reviewId/replies", auth, getReplies);
