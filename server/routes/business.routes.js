import express from "express";

import auth from "../middleware/auth.middleware.js";
import { requestRegistration } from "../controllers/business.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";

export const router = express.Router();

router.post("/", auth, getUpload().single("image"), requestRegistration);
