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
                users: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!chat) {
            return next(new HttpError("chat not found", 404));
        }

        if (chat.users.length < 2) {
            // one of the users of the chat was deleted
            return next(
                new HttpError("the chat user may have been deleted", 400)
            );
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
    } finally {
        await prisma.$disconnect();
    }
};

export const validateMessage = async (request, response, next) => {
    const select = request.select;
    const messageId = parseInt(request.params.messageId) || 0;

    try {
        const message = await prisma.message.findUnique({
            where: {
                id: messageId,
            },
            select: {
                id: true,
                ...select,
            },
        });

        if (!message || message.deleted) {
            return next(new HttpError("message not found", 404));
        }

        request.message = message;
        next();
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};
