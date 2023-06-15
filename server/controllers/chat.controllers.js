import { getChatData } from "../lib/chat.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { genericUserFields } from "../lib/data-source.lib.js";

export const startChat = async (request, response, next) => {
    const reqUser = request.user;
    const chatUserId = parseInt(request.params.userId) || 0;
    const io = request.io;

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
            return next(
                new HttpError(
                    "the user you are trying to chat with was not found, they may have been deleted",
                    404
                )
            );
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

        io.emit("new-chat", getChatData(createdChat));

        response.status(201).json({ chat: getChatData(createdChat) });
    } catch (error) {
        next(new HttpError());
    }
};

export const getChats = async (request, response, next) => {
    const user = request.user;

    try {
        const chats = await prisma.chat.findMany({
            where: {
                userIds: {
                    has: user.id,
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
            orderBy: {
                updatedAt: "desc",
            },
        });

        response.json({
            chats: chats
                .filter((chat) => chat.users.length === 2)
                .map((chat) => {
                    return getChatData(chat);
                }),
        });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};

export const resetUnseenMsgsCount = async (request, response, next) => {
    const user = request.user;
    const chatId = request.params.chatId;

    try {
        const chat = await prisma.chat.findUnique({
            where: {
                id: chatId,
            },
            select: {
                id: true,
                unseenMsgsCounts: true,
                userIds: true,
            },
        });

        if (!chat) {
            return next(new HttpError("chat not found", 404));
        }

        // check if the requesting user is a part of the chat
        if (!chat.userIds.find((userId) => userId === user.id)) {
            return next(
                new HttpError(
                    "you are unauthorized to perform this action",
                    401
                )
            );
        }

        await prisma.chat.update({
            where: {
                id: chatId,
            },
            data: {
                unseenMsgsCounts: {
                    ...chat.unseenMsgsCounts,
                    [user.id]: 0,
                },
            },
        });

        response.json({ message: "reset" });
    } catch (error) {
        next(new HttpError());
    }
};

// for testing purposes only

export const deleteChat = async (request, response, next) => {
    const chatId = request.params.chatId;

    try {
        await prisma.chat.delete({
            where: {
                id: chatId,
            },
        });

        response.json({});
    } catch (error) {
        next(new HttpError());
    }
};
