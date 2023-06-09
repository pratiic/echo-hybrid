import { genericUserFields } from "../lib/data-source.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateNotification } from "../validators/notification.validators.js";

export const sendNotification = async (request, response, next) => {
    const user = request.user;
    const notificationInfo = request.body;
    const io = request.io;

    // validate notification
    const errorMsg = validateNotification(notificationInfo);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    if (user.id === notificationInfo.destinationId) {
        return next(new HttpError("notification cannot be sent to self", 400));
    }

    try {
        const notification = await prisma.notification.create({
            data: {
                ...notificationInfo,
                originId: user.id,
                destinationId: parseInt(notificationInfo.destinationId),
                seen: false,
            },
            include: {
                origin: {
                    select: genericUserFields,
                },
            },
        });

        io.emit("notification", notification);

        response.status(201).json({
            notification,
        });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const getNotifications = async (request, response, next) => {
    const user = request.user;
    const page = parseInt(request.query.page) || 1;
    let skip = parseInt(request.query.skip);
    const PAGE_SIZE = 25;

    if (skip < 0) {
        skip = 0;
    }

    const whereObj = {
        destinationId: user?.isDeliveryPersonnel ? 0 : user.id,
    };

    try {
        const [notifications, totalCount] = await Promise.all([
            prisma.notification.findMany({
                // delivery personnel -> destinationId is 0
                // admin -> destinationId is -1

                where: whereObj,
                include: {
                    origin: {
                        select: genericUserFields,
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                take: PAGE_SIZE,
                skip: (page - 1) * PAGE_SIZE + skip,
            }),
            prisma.notification.count({
                where: whereObj,
            }),
        ]);

        response.json({ notifications, totalCount });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const deleteNotification = async (request, response, next) => {
    const user = request.user;
    const notificationId = parseInt(request.params.notificationId) || -1;

    try {
        // check if the requesting user is authorized to delete the notification
        const notification = await prisma.notification.findUnique({
            where: { id: notificationId },
        });

        if (!notification) {
            return next(new HttpError("notification not found", 404));
        }

        if (
            (user.isDeliveryPersonnel && notification.destinationId !== 0) ||
            notification.destinationId !== user.id
        ) {
            return next(
                new HttpError(
                    "you are not authorized to delete this notification",
                    401
                )
            );
        }

        await prisma.notification.delete({
            where: { id: notificationId },
        });

        response.json({ message: "notification deleted" });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const deleteAllNotifications = async (request, response, next) => {
    const user = request.user;

    try {
        await prisma.notification.deleteMany({
            where: {
                destinationId: user.id,
            },
        });

        response.json({});
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const setNotificationsSeen = async (request, response, next) => {
    const user = request.user;

    try {
        await prisma.notification.updateMany({
            where: { destinationId: user.isDeliveryPersonnel ? 0 : user.id },
            data: { seen: true },
        });

        response.json({});
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};
