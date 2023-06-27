import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateRating } from "../validators/rating.validators.js";

export const provideRating = async (request, response, next) => {
    const user = request.user;
    const targetId = parseInt(request.params.targetId);
    const targetType = request.params.targetType;
    const stars = request.body.stars;
    const target = request.target;
    const io = request.io;

    const errorMsg = validateRating({ targetId, targetType, stars });

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        const alreadyRated = target.ratings.find(
            (rating) => rating.userId === user.id
        )
            ? true
            : false;

        // calculate the new average rating of the target
        let totalStars = parseFloat(stars);
        target.ratings.forEach((rating) => {
            if (rating.userId !== user.id) {
                totalStars += rating.stars;
            }
        });
        const newRating = parseFloat(
            (
                totalStars /
                (alreadyRated
                    ? target.ratings.length
                    : target.ratings.length + 1)
            ).toFixed(1)
        );

        // prepare rating data
        const ratingData = {
            stars: parseFloat(stars),
            userId: user.id,
            [`${targetType}Id`]: targetId,
        };

        // save the rating and update the rating of the target
        const [rating] = await Promise.all([
            prisma.rating.upsert({
                where: {
                    [`user_${targetType}`]: {
                        userId: user.id,
                        [`${targetType}Id`]: targetId,
                    },
                },
                create: ratingData,
                update: ratingData,
            }),
            prisma[targetType].update({
                where: {
                    id: targetId,
                },
                data: {
                    rating: newRating,
                },
            }),
        ]);

        io.emit("rating", {
            rating,
            ratingNum: newRating,
        });

        response.json({
            target: {
                rating: newRating,
                ratings: [
                    ...target.ratings.filter(
                        (existingRating) => existingRating.id !== rating.id
                    ),
                    rating,
                ],
            },
            targetUserId:
                targetType === "product" ? target.store.userId : target.userId,
        });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const deleteRating = async (request, response, next) => {
    const user = request.user;
    const ratingId = parseInt(request.params.ratingId) || -1;
    const io = request.io;

    try {
        const rating = await prisma.rating.findUnique({
            where: {
                id: ratingId,
            },
        });

        if (!rating) {
            return next(new HttpError("rating not found", 404));
        }

        if (rating.userId !== user.id) {
            return next(
                new HttpError("you are unauthorized to delete this rating", 401)
            );
        }

        const targetType = rating.productId ? "product" : "store";
        const targetId = rating.productId || rating.storeId;

        const target = await prisma[targetType].findUnique({
            where: {
                id: targetId,
            },
            include: {
                ratings: true,
            },
        });

        // calculate the new average rating of the target
        let totalStars = 0;
        target.ratings.forEach((rating) => {
            totalStars += rating.stars;
        });
        const newRating =
            target.ratings.length === 1
                ? 0
                : parseFloat(
                      (
                          (totalStars - rating.stars) /
                          (target.ratings.length - 1)
                      ).toFixed(1)
                  );

        // delete rating and update target
        await Promise.all([
            prisma.rating.delete({
                where: {
                    id: ratingId,
                },
            }),
            prisma[targetType].update({
                where: {
                    id: targetId,
                },
                data: {
                    rating: newRating,
                },
            }),
        ]);

        io.emit("rating-delete", {
            id: rating.id,
            targetId: target.id,
            ratingNum: newRating,
        });

        response.json({
            target: {
                rating: newRating,
                ratings: target.ratings.filter(
                    (rating) => rating.userId !== user.id
                ),
            },
        });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};
