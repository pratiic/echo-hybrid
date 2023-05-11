import { prepareImageData } from "../lib/image.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateReview } from "../validators/review.validators.js";
import { validateId } from "../validators/utils.js";

export const postReview = async (request, response, next) => {
    const user = request.user;
    const targetId = parseInt(request.params.targetId);
    const targetType = request.params.targetType;
    const { text } = request.body;

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
        const target = await prisma[targetType].findUnique({
            where: {
                id: targetId,
            },
        });

        if (!target) {
            return next(new HttpError(`${targetType} not found`, 404));
        }

        // cannot review a second-hand product
        if (targetType === "product") {
            if (target.isSecondHand) {
                return next(
                    new HttpError(
                        "a second-hand product cannot be reviewed",
                        400
                    )
                );
            }
        }

        const createdReview = await prisma.review.upsert({
            where: {
                [`user_${targetType}`]: {
                    userId: user.id,
                    [`${targetType}Id`]: targetId,
                },
            },
            create: reviewData,
            update: reviewData,
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
            finalReview = updatedReview;
        }

        response.json({ review: finalReview });
    } catch (error) {
        next(new HttpError());
    }
};

export const getReviews = async (request, response, next) => {
    const targetId = parseInt(request.params.targetId);
    const targetType = request.params.targetType;

    let errorMsg = validateId(targetId);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

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
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        avatar: true,
                    },
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
    const user = request.user;
    const reviewId = parseInt(request.params.reviewId);

    const errorMsg = validateId(reviewId);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        const review = await prisma.review.findUnique({
            where: {
                id: reviewId,
            },
        });

        if (!review) {
            return next(new HttpError("review not found", 404));
        }

        if (review.userId !== user.id) {
            return next(
                new HttpError("you are unauthorized to delete this review", 401)
            );
        }

        await prisma.review.delete({
            where: {
                id: reviewId,
            },
        });

        response.json({
            message: "review has been deleted",
        });
    } catch (error) {
        next(new HttpError());
    }
};
