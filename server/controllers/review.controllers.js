import { genericUserFields } from "../lib/data-source.lib.js";
import { sendEmail } from "../lib/email.lib.js";
import { prepareImageData } from "../lib/image.lib.js";
import prisma from "../lib/prisma.lib.js";
import { capitalizeFirstLetter } from "../lib/strings.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateCause } from "../validators/report.validators.js";
import { validateReview } from "../validators/review.validators.js";

export const postReview = async (request, response, next) => {
    const user = request.user;
    const targetId = parseInt(request.params.targetId);
    const targetType = request.params.targetType;
    const { text } = request.body;
    const io = request.io;

    const errorMsg = validateReview({ targetId, targetType, text });

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    const reviewData = {
        text: text.trim(),
        user: {
            connect: {
                id: user.id,
            },
        },
        [`${targetType}`]: {
            connect: {
                id: targetId,
            },
        },
    };

    try {
        const createdReview = await prisma.review.upsert({
            where: {
                [`user_${targetType}`]: {
                    userId: user.id,
                    [`${targetType}Id`]: targetId,
                },
            },
            create: reviewData,
            update: reviewData,
            include: {
                user: {
                    select: genericUserFields,
                },
            },
        });
        let finalReview = createdReview;

        if (request.file) {
            // handle review image
            const imageData = prepareImageData(
                "review",
                createdReview.id,
                request.file
            );

            const [, updatedReview] = await Promise.all([
                prisma.image.upsert({
                    where: {
                        reviewId: createdReview.id,
                    },
                    update: imageData,
                    create: imageData,
                }),
                prisma.review.update({
                    where: { id: createdReview.id },
                    data: { image: imageData.src },
                }),
            ]);
            finalReview = { ...updatedReview, user: createdReview.user };
        }

        io.emit("comment", {
            type: "review",
            comment: finalReview,
            targetId,
        });

        response.status(201).json({ review: finalReview });
    } catch (error) {
        next(new HttpError());
    }
};

export const getReviews = async (request, response, next) => {
    const targetId = parseInt(request.params.targetId) || -1;
    const targetType = request.params.targetType;

    if (targetType !== "product" && targetType !== "store") {
        return next(new HttpError("invalid content type", 400));
    }

    try {
        const reviews = await prisma.review.findMany({
            where: {
                [`${targetType}Id`]: targetId,
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

        response.json({ reviews });
    } catch (error) {
        next(new HttpError());
    }
};

export const deleteReview = async (request, response, next) => {
    // admin may also delete a review based on a report or discovery
    const user = request.user;
    const reviewId = parseInt(request.params.reviewId) || -1;
    const io = request.io;
    const { cause } = request.body; // only for when deleted by admin

    if (user.isAdmin) {
        const errorMsg = validateCause(cause);

        if (errorMsg) {
            return next(new HttpError(errorMsg, 400));
        }
    }

    try {
        const review = await prisma.review.findUnique({
            where: {
                id: reviewId,
            },
            select: {
                id: true,
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
                text: true,
                image: true,
                productId: true,
                storeId: true,
            },
        });

        if (!review) {
            return next(new HttpError("review not found", 404));
        }

        if (review.user.id !== user.id && !user.isAdmin) {
            return next(
                new HttpError("you are unauthorized to delete this review", 401)
            );
        }

        await prisma.review.delete({
            where: {
                id: reviewId,
            },
        });

        if (user.isAdmin) {
            // send email to the creator of the review
            sendEmail(
                review.user.email,
                "review deletion",
                `your review of ${
                    review.productId ? "product" : "seller"
                } with id ${
                    review.productId ? review.productId : review.storeId
                } has been deleted because of the reason:\n${capitalizeFirstLetter(
                    cause
                )}`
            );
        }

        io.emit("comment-delete", {
            type: "review",
            id: reviewId,
        });

        response.json({
            message: "review has been deleted",
        });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};
