import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteAllNotifications,
    deleteNotification,
    getNotifications,
    sendNotification,
    setNotificationsSeen,
} from "../controllers/notification.controllers.js";

export const notificationRouter = (io) => {
    const router = express.Router();

    router.post("/", auth, (request, ...op) => {
        request.io = io;
        sendNotification(request, ...op);
    });

    router.get("/", auth, getNotifications);

    router.patch("/", auth, setNotificationsSeen);

    router.delete("/:notificationId", auth, deleteNotification);

    router.delete("/", auth, deleteAllNotifications);

    return router;
};
