import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";

export const validateChat = async (request, response, next) => {
    const user = request.user;
    const chatId = request.params.chatId || "";

    try {
        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
            },
            select: {
                id: true,
                userIds: true,
                unseenMsgsCounts: true,
            },
        });

        if (!chat) {
            return next(new HttpError("chat not found", 404));
        }

        if (request.validateChatUser) {
            // check if the requesting user is a member of the chat
            if (!chat.userIds.find((userId) => userId === user.id)) {
                return next(
                    new HttpError(
                        "you are unauthorized to perform any action on this chat",
                        401
                    )
                );
            }
        }

        request.chat = chat;
        next();
    } catch (error) {
        next(new HttpError());
    }
};
