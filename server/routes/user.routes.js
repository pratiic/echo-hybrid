import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteAvatar,
    deleteUser,
    getSelfDetails,
    getUserDetails,
    resetPassword,
    updateUser,
    verifyUser,
} from "../controllers/user.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";
import { extraUserFields, genericUserFields } from "../lib/data-source.lib.js";

export const router = express.Router();

router.patch(
    "/",
    (request, ...op) => {
        request.select = {
            firstName: true,
            lastName: true,
            phone: true,
        };
        auth(request, ...op);
    },
    getUpload().single("avatar"),
    updateUser
);

router.patch(
    "/password",
    (request, ...op) => {
        request.select = {
            password: true,
        };
        auth(request, ...op);
    },
    resetPassword
);

router.delete(
    "/avatar",
    (request, ...op) => {
        request.select = {
            avatar: true,
        };
        auth(request, ...op);
    },
    deleteAvatar
);

router.get("/:email", auth, getUserDetails);

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

// for test purposes only

router.delete(
    "/:userId",
    (request, ...op) => {
        request.validateAdmin = true;
        auth(request, ...op);
    },
    deleteUser
);

router.patch(
    "/:userId/verification",
    (request, ...op) => {
        request.validateAdmin = true;
        auth(request, ...op);
    },
    verifyUser
);
