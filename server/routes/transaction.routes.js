import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
    acknowledgeTransactions,
    deleteTransaction,
    getTransactions,
} from "../controllers/transaction.controllers.js";

export const transactionRouter = (io) => {
    const router = express.Router();

    router.get(
        "/",
        (request, ...op) => {
            request.select = {
                store: {
                    select: {
                        id: true,
                    },
                },
            };
            auth(request, ...op);
        },
        getTransactions
    );

    router.delete("/:transactionId", auth, deleteTransaction);

    router.patch(
        "/",
        (request, ...op) => {
            request.select = {
                store: {
                    id: true,
                },
            };
            auth(request, ...op);
        },
        acknowledgeTransactions
    );

    return router;
};
