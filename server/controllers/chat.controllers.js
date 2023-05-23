import { getChatData } from "../lib/chat.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { genericUserFields } from "../lib/data-source.lib.js";

export const startChat = async (request, response, next) => {
    const reqUser = request.user;
    const chatUserId = parseInt(request.params.userId) || 0;

    // cannot start a chat with oneself
    if (chatUserId === reqUser.id) {
        return next(
            new HttpError("you cannot start a chat with yourself", 400)
        );
    }

    try {
        // check to see if the provided user exists
        const chatUser = await prisma.user.findUnique({
            where: {
                id: chatUserId,
            },
        });

        if (!chatUser) {
            return next(new HttpError("user not found", 404));
        }

        // check to see if a chat with the provided user already exists
        const chats = await prisma.chat.findMany({
            where: {
                OR: [
                    {
                        id: `${reqUser.id}-${chatUser.id}`,
                    },
                    {
                        id: `${chatUser.id}-${reqUser.id}`,
                    },
                ],
            },
            include: {
                users: {
                    select: {
                        user: {
                            select: genericUserFields,
                        },
                    },
                },
            },
        });

        if (chats.length > 0) {
            return response.json({ chat: getChatData(chats[0]) });
        }

        // create a new chat
        const createdChat = await prisma.chat.create({
            data: {
                id: `${reqUser.id}-${chatUser.id}`,
                users: {
                    create: [
                        {
                            userId: reqUser.id,
                        },
                        {
                            userId: chatUser.id,
                        },
                    ],
                },
                userIds: [reqUser.id, chatUser.id],
                unseenMsgsCounts: {
                    [reqUser.id]: 0,
                    [chatUserId]: 0,
                },
            },
            include: {
                users: {
                    select: {
                        user: {
                            select: genericUserFields,
                        },
                    },
                },
            },
        });

        response.status(201).json({ chat: getChatData(createdChat) });
    } catch (error) {
        next(new HttpError());
    }
};