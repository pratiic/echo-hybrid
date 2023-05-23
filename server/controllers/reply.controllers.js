import { genericUserFields } from "../lib/data-source.lib.js";
import { prepareImageData } from "../lib/image.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateReply } from "../validators/reply.validators.js";

export const replyToReview = async (request, response, next) => {
    const user = request.user;
    const reviewId = parseInt(request.params.reviewId);
    const { text } = request.body;

    // validate reply
    const errorMsg = validateReply({ reviewId, text });

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    const replyData = {
        text,
        userId: user.id,
        reviewId: reviewId,
    };

    try {
        const createdReply = await prisma.reply.create({
            data: replyData,
            include: {
                user: {
                    select: genericUserFields,
                },
            },
        });

        let finalReply = createdReply;

        if (request.file) {
            // handle reply image
            const replyId = createdReply.id;
            const imageData = prepareImageData("reply", replyId, request.file);

            const [, updatedReply] = await Promise.all([
                prisma.image.upsert({
                    where: { replyId },
                    update: imageData,
                    create: imageData,
                }),
                prisma.reply.update({
                    where: { id: replyId },
                    data: { image: imageData.src },
                    include: {
                        user: {
                            select: genericUserFields,
                        },
                    },
                }),
            ]);

            finalReply = { ...updatedReply, user: createdReply.user };
        }

        response.status(201).json({ reply: finalReply });
    } catch (error) {
        if (error.message.includes("Foreign key constraint failed")) {
            return next(new HttpError("review not found", 404));
        }

        next(new HttpError());
    }
};

export const getReplies = async (request, response, next) => {
    const reviewId = parseInt(request.params.reviewId) || 0;

    try {
        const replies = await prisma.reply.findMany({
            where: {
                reviewId,
            },
            include: {
                user: {
                    select: genericUserFields,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        response.json({ replies });
    } catch (error) {
        next(new HttpError());
    }
};

export const deleteReply = async (request, response, next) => {
    const user = request.user;
    const replyId = parseInt(request.params.replyId) || 0;

    try {
        const reply = await prisma.reply.findUnique({
            where: {
                id: replyId,
            },
        });

        if (!reply) {
            return next(new HttpError("reply not found", 404));
        }

        // check reply user
        if (reply.userId !== user.id) {
            return next(
                new HttpError("you are unauthorized to delete this reply", 401)
            );
        }

        await prisma.reply.delete({
            where: {
                id: replyId,
            },
        });

        response.json({ message: "the reply has been deleted" });
    } catch (error) {
        next(new HttpError());
    }
};
