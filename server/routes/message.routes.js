import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteMessage,
    getMessages,
    sendMessage,
    setMessageSeen,
} from "../controllers/message.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";
import {
    validateChat,
    validateMessage,
} from "../middleware/message.middleware.js";

export const messageRouter = (io) => {
    const router = express.Router();

    router.post(
        "/:chatId",
        auth,
        getUpload().single("image"),
        (request, response, next) => {
            request.validateChatUser = true;
            request.io = io;
            validateChat(request, response, next);
        },
        sendMessage
    );

    router.get(
        "/:chatId",
        auth,
        (request, response, next) => {
            request.validateChatUser = true;
            request.io = io;
            validateChat(request, response, next);
        },
        getMessages
    );

    router.patch(
        "/:messageId",
        auth,
        (request, ...op) => {
            request.select = {
                chatId: true,
                chat: {
                    select: {
                        id: true,
                        unseenMsgsCounts: true,
                    },
                },
            };
            validateMessage(request, ...op);
        },
        (request, ...op) => {
            request.io = io;
            setMessageSeen(request, ...op);
        }
    );

    router.delete(
        "/:messageId",
        auth,
        (request, ...op) => {
            request.select = {
                userId: true,
                image: true,
            };
            validateMessage(request, ...op);
        },
        (request, ...op) => {
            request.io = io;
            deleteMessage(request, ...op);
        }
    );

    return router;
};
