import { transactionSelectionFields } from "../lib/data-source.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateMonthYear } from "../validators/transaction.validators.js";

export const getTransactions = async (request, response, next) => {
    const user = request.user;
    const type = request.query.type; // user or seller
    const month = parseInt(request.query.month);
    const year = parseInt(request.query.year);
    const page = parseInt(request.query.page) || 1;
    const skip = parseInt(request.query.skip) || 0;
    const searchQuery = request.query.query || "";
    const PAGE_SIZE = 10;

    if (type !== "user" && type !== "seller") {
        return next(
            new HttpError("invalid type - valid types are 'user' and 'seller'")
        );
    }

    if (month || year) {
        const errorMsg = validateMonthYear({ month, year });

        if (errorMsg) {
            return next(new HttpError(errorMsg, 400));
        }
    }

    let monthYearFilter = {};

    if (month && year) {
        monthYearFilter = {
            createdMonth: month,
            createdYear: year,
        };
    }

    let searchFilter = {};

    if (searchQuery) {
        searchFilter = {
            OR: [
                {
                    order: {
                        product: {
                            name: {
                                contains: searchQuery,
                                mode: "insensitive",
                            },
                        },
                    },
                },
            ],
        };
    }

    const whereObj = {
        order: getTypeFilter(type, user),
        ...monthYearFilter,
        ...searchFilter,
        isDeleted: false,
        NOT: {
            deletedFor: user.id,
        },
    };

    try {
        const [transactions, totalCount] = await Promise.all([
            prisma.transaction.findMany({
                where: whereObj,
                select: { ...transactionSelectionFields, deletedFor: true },
                orderBy: {
                    createdAt: "desc",
                },
                take: PAGE_SIZE,
                skip: (page - 1) * PAGE_SIZE + skip,
            }),
            prisma.transaction.count({
                where: whereObj,
            }),
        ]);

        response.json({
            transactions,
            totalCount,
        });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};

export const deleteTransaction = async (request, response, next) => {
    // 1. delete a transaction for a user or a seller
    // 2. if already deleted for someone, set isDeleted to true

    const user = request.user;
    const transactionId = parseInt(request.params.transactionId) || -1;

    try {
        const transaction = await prisma.transaction.findUnique({
            where: {
                id: transactionId,
            },
            select: {
                id: true,
                order: {
                    select: {
                        originId: true,
                        store: {
                            select: {
                                userId: true,
                            },
                        },
                    },
                },
                deletedFor: true,
                isDeleted: true,
            },
        });

        if (!transaction) {
            return next(new HttpError("transaction not found", 404));
        }

        const {
            isDeleted,
            deletedFor,
            order: { originId, store },
        } = transaction;

        if (originId !== user.id && store.userId !== user.id) {
            return next(
                new HttpError(
                    "you are unauthorized to delete this transaction",
                    401
                )
            );
        }

        if (isDeleted || deletedFor === user.id) {
            return next(
                new HttpError("the transaction has already been deleted", 400)
            );
        }

        await prisma.transaction.update({
            where: {
                id: transaction.id,
            },
            data: deletedFor
                ? { isDeleted: true, deletedFor: null }
                : { deletedFor: user.id },
        });

        response.json({ message: "the transaction has been deleted" });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};

export const acknowledgeTransactions = async (request, response, next) => {
    const user = request.user;
    const type = request.query.type;

    if (type !== "user" && type !== "seller") {
        return next(
            new HttpError(
                "invalid type - valid types are 'user' and 'seller'",
                400
            )
        );
    }

    try {
        await prisma.transaction.updateMany({
            where: {
                order: getTypeFilter(type, user),
                NOT: {
                    completedBy: user.id,
                },
            },
            data: {
                acknowledged: true,
            },
        });

        response.json({ message: "transactions acknowledged" });
    } catch (error) {
        next(new HttpError());
    }
};

function getTypeFilter(type, user) {
    let typeFilter = {};

    if (type === "user") {
        typeFilter = {
            originId: user.id,
        };
    } else {
        typeFilter = {
            storeId: user.store.id,
        };
    }

    return typeFilter;
}
