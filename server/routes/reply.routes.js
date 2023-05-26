import express from "express";

import auth from "../middleware/auth.middleware.js";
import {
    deleteReply,
    getReplies,
    replyToReview,
} from "../controllers/reply.controllers.js";
import { getUpload } from "../middleware/multer.middleware.js";

export const replyRouter = (io) => {
    const router = express.Router();

    router.post(
        "/:reviewId",
        auth,
        getUpload().single("image"),
        (request, ...op) => {
            request.io = io;
            replyToReview(request, ...op);
        }
    );

    router.get("/:reviewId/replies", auth, getReplies);

    router.delete("/:replyId", auth, (request, ...op) => {
        request.io = io;
        deleteReply(request, ...op);
    });

    return router;
};
