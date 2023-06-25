import express from "express";
import auth from "../middleware/auth.middleware.js";
import {
    acknowledgeTransactions,
    deleteTransaction,
    generateCSV,
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
                    select: {
                        id: true,
                    },
                },
            };
            auth(request, ...op);
        },
        acknowledgeTransactions
    );

    router.get("/csv", auth, generateCSV);

    return router;
};
