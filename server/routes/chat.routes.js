import express from "express";

import auth from "../middleware/auth.middleware.js";
import { startChat } from "../controllers/chat.controllers.js";

export const router = express.Router();

router.post("/:userId", auth, startChat);
