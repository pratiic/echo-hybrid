import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";

export const getAppStats = async (request, response, next) => {
    // statistics regarding products, sellers, sales, users and so on

    const getOrderFilter = (status) => {
        if (!status) {
            return {};
        }

        status = status.toUpperCase();
        return {
            status,
        };
    };

    try {
        const [
            productCount,
            secondHandProductCount,
            sellerCount,
            busSellerCount,
            verifiedBusSellerCount,
            userCount,
            verifiedUserCount,
            deliveryPersonnelCount,
            orderCount,
            placedOrderCount,
            cancelledOrderCount,
            confirmedOrderCount,
            rejectedOrderCount,
            packagedOrderCount,
            completedOrderCount,
            transactionCount,
            secondHandTransactionCount,
            pendingDeliveryCount,
            completedDeliveryCount,
        ] = await Promise.all([
            prisma.product.count({
                where: {
                    isDeleted: false,
                },
            }),
            prisma.product.count({
                where: {
                    isDeleted: false,
                    store: {
                        storeType: "IND",
                    },
                },
            }),
            prisma.store.count({
                where: {
                    isDeleted: false,
                },
            }),
            prisma.store.count({
                where: {
                    isDeleted: false,
                    storeType: "BUS",
                },
            }),
            prisma.store.count({
                where: {
                    isDeleted: false,
                    storeType: "BUS",
                    business: {
                        isVerified: true,
                    },
                },
            }),
            prisma.user.count({
                where: {},
            }),
            prisma.user.count({
                where: {
                    isVerified: true,
                },
            }),
            prisma.user.count({
                where: {
                    isDeliveryPersonnel: true,
                },
            }),
            prisma.order.count({
                where: {},
            }),
            ...[
                "placed",
                "cancelled",
                "confirmed",
                "rejected",
                "packaged",
                "completed",
            ].map((status) => {
                return prisma.order.count({
                    where: getOrderFilter(status),
                });
            }),
            prisma.transaction.count({
                where: {},
            }),
            prisma.transaction.count({
                where: {
                    order: {
                        product: {
                            isSecondHand: true,
                        },
                    },
                },
            }),
            prisma.order.count({
                where: {
                    status: "PACKAGED",
                    isDelivered: true,
                },
            }),
            prisma.delivery.count({
                where: {},
            }),
        ]);

        response.json({
            products: {
                total: productCount,
                secondHand: secondHandProductCount,
                brandNew: productCount - secondHandProductCount,
            },
            sellers: {
                total: sellerCount,
                business: busSellerCount,
                individual: sellerCount - busSellerCount,
            },
            users: {
                total: userCount,
                verified: verifiedUserCount,
                unverified: userCount - verifiedUserCount,
                deliveryPersonnel: deliveryPersonnelCount,
            },
            orders: {
                total: orderCount,
                placed: placedOrderCount,
                cancelled: cancelledOrderCount,
                confirmed: confirmedOrderCount,
                rejected: rejectedOrderCount,
                packaged: packagedOrderCount,
                completed: completedOrderCount,
            },
            transactions: {
                total: transactionCount,
                secondHand: secondHandTransactionCount,
            },
            deliveries: {
                pending: pendingDeliveryCount,
                completed: completedDeliveryCount,
            },
        });
    } catch (error) {
        next(new HttpError());
    }
};
