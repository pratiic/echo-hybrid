import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteAvatar,
    getSelfDetails,
    getUserDetails,
    resetPassword,
    updateUser,
} from "../controllers/user.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";
import { extraUserFields, genericUserFields } from "../lib/data-source.lib.js";

export const router = express.Router();

router.patch("/", auth, getUpload().single("avatar"), updateUser);

router.patch("/password", auth, resetPassword);

router.delete("/avatar", auth, deleteAvatar);

router.get(
    "/",
    (request, response, next) => {
        request.select = {
            ...genericUserFields,
            ...extraUserFields,
        };

        auth(request, response, next);
    },
    getSelfDetails
);

router.get("/:email", auth, getUserDetails);
