import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteAvatar,
    getUserDetails,
    resetPassword,
    updateUser,
} from "../controllers/user.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";

export const router = express.Router();

router.patch("/", auth, getUpload().single("avatar"), updateUser);

router.patch("/password", auth, resetPassword);

router.delete("/avatar", auth, deleteAvatar);

router.get("/", auth, getUserDetails);
