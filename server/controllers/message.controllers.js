import { prepareImageData } from "../lib/image.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateMessage } from "../validators/message.validators.js";

export const sendMessage = async (request, response, next) => {
    const user = request.user;
    const chat = request.chat;
    const messageInfo = request.body;
    let finalMessage = null;

    try {
        const errorMsg = validateMessage(
            messageInfo,
            request.file ? true : false
        );

        if (errorMsg) {
            return next(new HttpError(errorMsg, 400));
        }

        const chatUserId = chat.userIds.find((userId) => userId !== user.id);

        await prisma.$transaction(async (prisma) => {
            const [createdMessage] = await Promise.all([
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
        });

        response.status(201).json({
            message: finalMessage,
        });
    } catch (error) {
        next(new HttpError());
    }
};

export const getMessages = async (request, response, next) => {
    const chat = request.chat;

    try {
        const messages = await prisma.message.findMany({
            where: {
                chatId: chat.id,
            },
            orderBy: [
                {
                    createdAt: "asc",
                },
            ],
        });

        response.json({ messages });
    } catch (error) {
        next(new HttpError());
    }
};

export const deleteMessage = async (request, response, next) => {
    const user = request.user;
    const messageId = parseInt(request.params.messageId) || 0;

    try {
        const message = await prisma.message.findUnique({
            where: {
                id: messageId,
            },
            select: {
                id: true,
                userId: true,
            },
        });

        if (!message) {
            return next(new HttpError("message not found", 404));
        }

        if (message.userId !== user.id) {
            return next(
                new HttpError(
                    "you are unauthorized to delete this message",
                    401
                )
            );
        }

        await prisma.message.delete({
            where: {
                id: messageId,
            },
        });

        response.json({
            message: "the message has been deleted",
        });
    } catch (error) {
        next(new HttpError(error));
    }
};
