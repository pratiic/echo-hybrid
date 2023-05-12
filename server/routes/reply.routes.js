import express from "express";
import auth from "../middleware/auth.middleware.js";
import { replyToReview } from "../controllers/reply.controllers.js";

export const router = express.Router();

router.post("/:reviewId", auth, replyToReview);
