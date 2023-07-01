import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteChat,
    getChats,
    resetUnseenMsgsCount,
    startChat,
} from "../controllers/chat.controllers.js";
import prisma from "../lib/prisma.lib.js";

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

    router.patch("/unseen/:chatId", auth, resetUnseenMsgsCount);

    router.post("/direct/admin", auth, (request, ...op) => {
        request.withAdmin = true;
        startChat(request, ...op);
    });

    // for testing purposes only

    router.delete(
        "/:chatId",
        (request, ...op) => {
            request.validateAdmin = true;
            auth(request, ...op);
        },
        deleteChat
    );

    return router;
};
