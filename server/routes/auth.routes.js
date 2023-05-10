import express from "express";

import { signUserIn, signUserUp } from "../controllers/auth.controllers.js";

export const router = express.Router();

router.post("/signup", signUserUp);

router.post("/signin", signUserIn);
