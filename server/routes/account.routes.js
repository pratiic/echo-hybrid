import express from "express";

import {
    createAccountRecovery,
    createAccountVerification,
    recoverAccount,
    verifyAccount,
} from "../controllers/account.controllers.js";
import auth from "../middleware/auth.middleware.js";

export const router = express.Router();

router.get("/verification", auth, createAccountVerification);

router.post("/verification", auth, verifyAccount);

router.post("/recovery", createAccountRecovery);

router.patch("/recovery", recoverAccount);
