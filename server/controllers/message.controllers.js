import { prepareImageData } from "../lib/image.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateMessage } from "../validators/message.validators.js";

export const sendMessage = async (request, response, next) => {
    const user = request.user;
    const chat = request.chat;
    const messageInfo = request.body;
    const io = request.io;
    let finalMessage = null,
        updatedChat = null;

    try {
        const errorMsg = validateMessage(
            messageInfo,
            request.file ? true : false
        );

        if (errorMsg) {
            return next(new HttpError(errorMsg, 400));
        }

        const chatUserId = chat.userIds.find((userId) => userId !== user.id);

        const [createdMessage, uc] = await Promise.all([
            prisma.message.create({
                data: {
                    text: messageInfo.text?.trim(),
                    chatId: chat.id,
                    userId: user.id,
                },
            }),
            prisma.chat.update({
                where: {
                    id: chat.id,
                },
                data: {
                    // increment the count of unseen messages for the chat user (the other user in the chat)
                    unseenMsgsCounts: {
                        ...chat.unseenMsgsCounts,
                        [chatUserId]: ++chat.unseenMsgsCounts[chatUserId],
                    },
                },
            }),
        ]);

        finalMessage = createdMessage;
        updatedChat = uc;

        if (request.file) {
            // handle message image
            const imageData = prepareImageData(
                "message",
                createdMessage.id,
                request.file
            );

            const [, updatedMessage] = await Promise.all([
                prisma.image.create({
                    data: imageData,
                }),
                prisma.message.update({
                    where: {
                        id: createdMessage.id,
                    },
                    data: {
                        image: imageData.src,
                    },
                }),
            ]);

            finalMessage = updatedMessage;
        }

        io.emit("new-message", {
            chatId: finalMessage.chatId,
            userId: finalMessage.userId,
            destinationId: chatUserId,
            unseenCount: updatedChat.unseenMsgsCounts[chatUserId],
        });

        io.emit("chat-message", {
            ...finalMessage,
            destinationId: chatUserId,
        });

        response.status(201).json({
            message: finalMessage,
        });
    } catch (error) {
        console.log(error);

        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const getMessages = async (request, response, next) => {
    const chat = request.chat;
    const page = parseInt(request.query.page) || 1;
    let skip = parseInt(request.query.skip) || -1;
    const PAGE_SIZE = 25;

    if (skip < 0) {
        skip = 0;
    }

    try {
        const [messages, totalCount] = await Promise.all([
            prisma.message.findMany({
                where: {
                    chatId: chat.id,
                },
                orderBy: [
                    {
                        createdAt: "desc",
                    },
                ],
                take: PAGE_SIZE,
                skip: (page - 1) * PAGE_SIZE + skip,
            }),
            prisma.message.count({
                where: {
                    chatId: chat.id,
                },
            }),
        ]);

        response.json({
            messages: messages.sort((a, b) => a.createdAt - b.createdAt),
            totalCount,
        });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const setMessageSeen = async (request, response, next) => {
    const user = request.user;
    const message = request.message;
    const chat = message.chat;
    const io = request.io;

    try {
        const [updatedMessage] = await Promise.all([
            prisma.message.update({
                where: {
                    id: message.id,
                },
                data: {
                    seen: true,
                },
            }),
            prisma.chat.update({
                where: {
                    id: message.chatId,
                },
                data: {
                    unseenMsgsCounts: {
                        ...chat.unseenMsgsCounts,
                        [user.id]: chat.unseenMsgsCounts[user.id]
                            ? --chat.unseenMsgsCounts[user.id]
                            : 0,
                    },
                },
            }),
        ]);

        io.emit("message-update", {
            id: message.id,
            chatId: message.chatId,
            updateInfo: { seen: true },
        });

        response.json({ message: updatedMessage });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const deleteMessage = async (request, response, next) => {
    const user = request.user;
    const message = request.message;
    const io = request.io;

    try {
        if (message.userId !== user.id) {
            return next(
                new HttpError(
                    "you are unauthorized to delete this message",
                    401
                )
            );
        }

        const operations = [
            prisma.message.update({
                where: {
                    id: message.id,
                },
                data: {
                    deleted: true,
                    text: "",
                    image: "",
                },
            }),
        ];

        if (message.image) {
            operations.push(
                prisma.image.delete({
                    where: {
                        messageId: message.id,
                    },
                })
            );
        }

        await Promise.all(operations);

        io.emit("message-delete", message.id);

        response.json({
            message: "the message has been deleted",
        });
    } catch (error) {
        console.log(error);
        next(new HttpError(error));
    } finally {
        await prisma.$disconnect();
    }
};
