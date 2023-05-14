import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteRating,
    provideRating,
} from "../controllers/rating.controllers.js";

export const router = express.Router();

router.post("/:targetType/:targetId", auth, provideRating);

router.delete("/:ratingId", auth, deleteRating);
