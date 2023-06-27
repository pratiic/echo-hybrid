import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateTargetType } from "../validators/feedback.validators.js";

export const validateFeedback = async (request, response, next) => {
    const user = request.user;
    const targetId = parseInt(request.params.targetId) || -1;
    const targetType = request.params.targetType;
    const action = request.action;

    const errorMsg = validateTargetType(targetType);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    const selectionMap = {
        product: {
            id: true,
            isSecondHand: true,
            store: {
                select: {
                    id: true,
                    userId: true,
                },
            },
        },
        store: {
            id: true,
            userId: true,
        },
    };

    try {
        const target = await prisma[targetType].findUnique({
            where: {
                id: targetId,
            },
            select: {
                id: true,
                ...selectionMap[targetType],
                ...(request.select || {}),
            },
        });

        if (!target) {
            return next(new HttpError(`${targetType} not found`, 404));
        }

        // cannot review or rate a second-hand product
        if (targetType === "product" && target.isSecondHand) {
            return next(
                new HttpError(
                    `a second-hand product cannot be ${
                        action === "review" ? "reviewed" : "rated"
                    }`,
                    400
                )
            );
        }

        // cannot review or rate one's own product or seller profile
        if (
            (targetType === "product" && target.store.userId === user.id) ||
            (targetType === "store" && target.userId === user.id)
        ) {
            return next(
                new HttpError(
                    `you cannot ${action} your own ${targetType}`,
                    400
                )
            );
        }

        // must buy a product or buy from a seller before rating it
        const transactions = await prisma.transaction.findMany({
            where: {
                order: {
                    originId: user.id,
                    [`${targetType}Id`]: targetId,
                },
            },
            select: {
                id: true,
            },
        });

        if (transactions.length === 0) {
            return next(
                new HttpError(
                    `you must buy ${
                        targetType === "product"
                            ? "this product"
                            : "from this seller"
                    } before ${action === "review" ? "reviewing" : "rating"} ${
                        targetType === "product" ? "it" : "them"
                    }`,
                    400
                )
            );
        }

        request.target = target;
        next();
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};
