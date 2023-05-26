import express from "express";

import {
    createAccountRecovery,
    createAccountVerification,
    recoverAccount,
    verifyAccount,
} from "../controllers/account.controllers.js";
import auth from "../middleware/auth.middleware.js";

export const router = express.Router();

router.get(
    "/verification",
    (request, response, next) => {
        request.select = {
            isVerified: true,
            email: true,
        };
        auth(request, response, next);
    },
    createAccountVerification
);

router.post(
    "/verification",
    (request, response, next) => {
        request.select = {
            isVerified: true,
        };
        auth(request, response, next);
    },
    verifyAccount
);

router.post("/recovery", createAccountRecovery);

router.patch("/recovery", recoverAccount);
