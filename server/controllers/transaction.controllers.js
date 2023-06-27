import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";

import { transactionSelectionFields } from "../lib/data-source.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import {
    validateMonthYear,
    validateYear,
} from "../validators/transaction.validators.js";
import { getSubtotal } from "../lib/transaction.lib.js";

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

    let whereObj = {
        order: getTypeFilter(type, user),
        ...monthYearFilter,
        ...searchFilter,
        isDeleted: false,
    };

    if (type === "user") {
        whereObj = {
            ...whereObj,
            deletedForBuyer: false,
        };
    } else {
        whereObj = {
            ...whereObj,
            deletedForSeller: false,
        };
    }

    try {
        const [transactions, totalCount] = await Promise.all([
            prisma.transaction.findMany({
                where: whereObj,
                select: transactionSelectionFields,
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
            // transactions: transactions.filter(
            //     (transaction) => transaction.deletedFor !== user.id
            // ),
            transactions,
            totalCount,
        });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
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
                deletedForBuyer: true,
                deletedForSeller: true,
                isDeleted: true,
            },
        });

        if (!transaction) {
            return next(new HttpError("transaction not found", 404));
        }

        const {
            isDeleted,
            deletedForBuyer,
            deletedForSeller,
            order: { originId, store },
        } = transaction;
        const isUserBuyer = originId === user.id;

        if (
            isDeleted ||
            (isUserBuyer && deletedForBuyer) ||
            (!isUserBuyer && deletedForSeller)
        ) {
            return next(new HttpError("transaction not found", 404));
        }

        if (originId !== user.id && store.userId !== user.id) {
            return next(
                new HttpError(
                    "you are unauthorized to delete this transaction",
                    401
                )
            );
        }

        const updatedTransaction = await prisma.transaction.update({
            where: {
                id: transaction.id,
            },
            data:
                deletedForBuyer || deletedForSeller
                    ? { isDeleted: true }
                    : isUserBuyer
                    ? { deletedForBuyer: true }
                    : { deletedForSeller: true },
            select: {
                id: true,
                isDeleted: true,
                deletedForBuyer: true,
                deletedForSeller: true,
            },
        });

        response.json({ transaction: updatedTransaction });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const acknowledgeTransactions = async (request, response, next) => {
    const user = request.user;

    try {
        await prisma.transaction.updateMany({
            where: {
                order: {
                    storeId: user.store?.id,
                },
                isAcknowledged: false,
            },
            data: {
                isAcknowledged: true,
            },
        });

        response.json({});
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const generateCSV = async (request, response, next) => {
    const user = request.user;
    const type = request.query.type; // indicates sales or purchase history
    const displayType = request.query.display;
    const year = parseInt(request.query.year);
    const month = parseInt(request.query.month);

    console.log(month);

    if (type !== "user" && type !== "seller") {
        return next(
            new HttpError(
                "invalid type - valid types are 'user' for purchase history and 'seller' for sales history"
            )
        );
    }

    if (
        displayType !== "all" &&
        displayType !== "month" &&
        displayType !== "year"
    ) {
        return next(
            new HttpError(
                "invalid display type - valid types are 'all' for all history, 'month' for the history of a specific month and 'year' for the history of a specific year"
            )
        );
    }

    const errorMsg =
        displayType === "year"
            ? validateYear(year)
            : displayType === "month"
            ? validateMonthYear({ month, year })
            : "";

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    const displayFilter =
        displayType === "year"
            ? { createdYear: year }
            : displayType === "month"
            ? { createdYear: year, createdMonth: month }
            : {};

    const whereObj = {
        order: getTypeFilter(type, user),
        ...displayFilter,
    };

    try {
        const transactions = await prisma.transaction.findMany({
            where: whereObj,
            select: {
                id: true,
                order: {
                    include: {
                        product: true,
                        store: {
                            include: {
                                user: true,
                                business: true,
                            },
                        },
                    },
                },
                createdAt: true,
            },
        });

        if (transactions.length === 0) {
            return next(
                new HttpError(
                    "there are no transactions to generate csv for",
                    400
                )
            );
        }

        const transactionFields = [
            {
                id: "transactionId",
                title: "transaction Id",
            },
            {
                id: "productId",
                title: "product Id",
            },
            {
                id: "productName",
                title: "product name",
            },
            {
                id: "productVariant",
                title: "product variant",
            },
            {
                id: "unitPrice",
                title: "unit price",
            },
            {
                id: "quantity",
                title: "quantity",
            },
            {
                id: "delivery",
                title: "delivery",
            },
            {
                id: "deliveryCharge",
                title: "delivery charge",
            },
            {
                id: "subTotal",
                title: "sub total",
            },
            {
                id: "orderId",
                title: "order Id",
            },
            {
                id: "sellerId",
                title: "seller Id",
            },
            {
                id: "sellerName",
                title: "seller name",
            },
            {
                id: "orderDate",
                title: "ordered date",
            },
            {
                id: "orderCompletionDate",
                title: "order completion date",
            },
        ];

        const filePath = `${
            type === "user" ? "purchase" : "sales"
        }-history.csv`;

        const csvWriter = createObjectCsvWriter({
            path: filePath,
            header: transactionFields,
        });

        const transactionRecords = transactions.map((transaction) => {
            const {
                id,
                order: {
                    id: orderId,
                    product: { id: productId, name: productName },
                    unitPrice,
                    variant,
                    quantity,
                    consumerAddress,
                    isDelivered,
                    deliveryCharge,
                    store: {
                        id: sellerId,
                        user: { fullName: sellerName },
                        storeType,
                    },
                    createdAt: orderCreatedAt,
                },
                createdAt,
            } = transaction;

            return {
                transactionId: id,
                productId,
                productName,
                productVariant: variant ? getVariantInfo(variant) : "N/A",
                unitPrice,
                quantity: quantity || 1,
                consumerAddress: isDelivered ? consumerAddress : "N/A",
                delivery: isDelivered ? "available" : "not available",
                deliveryCharge: isDelivered ? deliveryCharge : "N/A",
                subTotal: getSubtotal(
                    unitPrice,
                    quantity,
                    deliveryCharge,
                    true,
                    isDelivered
                ),
                orderId,
                sellerId: type === "user" ? sellerId : "N/A",
                sellerName:
                    type === "user"
                        ? storeType === "IND"
                            ? sellerName
                            : store.business.name
                        : "N/A",
                orderDate: orderCreatedAt,
                orderCompletionDate: createdAt,
            };
        });

        await csvWriter.writeRecords(transactionRecords);

        response.setHeader("Content-Type", "application/octet-stream");
        response.setHeader(
            "Content-Disposition",
            `attachment; filename=${filePath}`
        );
        response.setHeader("file-name", filePath);

        response.download(filePath, (err) => {
            if (err) {
                console.log(err);
                next(new HttpError());
            }

            fs.unlinkSync(filePath);
        });

        await csvWriter.writeRecords(transactionRecords);
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
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
            storeId: user.store?.id,
        };
    }

    return typeFilter;
}

function getVariantInfo(variant) {
    let variantInfo = "";

    Object.keys(variant).forEach((key) => {
        if (key !== "id" && key !== "quantity") {
            variantInfo += `${key} ${variant[key]}\n`;
        }
    });

    return variantInfo;
}
