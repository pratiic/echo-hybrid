import express from "express";

import auth from "../middleware/auth.middleware.js";
import { getChats, startChat } from "../controllers/chat.controllers.js";

export const chatRouter = (io) => {
    const router = express.Router();

    router.post("/:userId", auth, (request, ...op) => {
        request.io = io;
        startChat(request, ...op);
    });

    router.get("/", auth, (request, ...op) => {
        request.io = io;
        getChats(request, ...op);
    });

    return router;
};
