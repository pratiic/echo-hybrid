import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateNotification } from "../validators/notification.validators.js";

export const sendNotification = async (request, response, next) => {
    const user = request.user;
    const notificationInfo = request.body;

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
        });

        response.status(201).json({
            notification,
        });
    } catch (error) {
        next(new HttpError());
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

        if (notification.destinationId !== user.id) {
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
    }
};

export const setNotificationsSeen = async (request, response, next) => {
    const user = request.user;

    try {
        await prisma.notification.updateMany({
            where: { destinationId: user.id },
            data: { seen: true },
        });

        response.json({});
    } catch (error) {
        next(new HttpError());
    }
};
