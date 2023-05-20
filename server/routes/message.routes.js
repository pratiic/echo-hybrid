import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteMessage,
    getMessages,
    sendMessage,
} from "../controllers/message.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";
import { validateChat } from "../middleware/message.middleware.js";

export const router = express.Router();

router.post(
    "/:chatId",
    auth,
    getUpload().single("image"),
    (request, response, next) => {
        request.validateChatUser = true;
        validateChat(request, response, next);
    },
    sendMessage
);

router.get(
    "/:chatId",
    auth,
    (request, response, next) => {
        request.validateChatUser = true;
        validateChat(request, response, next);
    },
    getMessages
);

router.delete("/:messageId", auth, deleteMessage);
