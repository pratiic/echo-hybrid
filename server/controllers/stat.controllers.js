import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";

export const getAppStats = async (request, response, next) => {
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
            productSuspensionCount,
            sellerSuspensionCount,
            userSuspensionCount,
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
            ...["product", "store", "user"].map((targetType) => {
                return prisma.suspension.count({
                    where: {
                        targetType,
                    },
                });
            }),
        ]);

        response.json({
            products: {
                total: productCount,
                "brand new": productCount - secondHandProductCount,
                "second hand": secondHandProductCount,
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
                "brand new": transactionCount - secondHandTransactionCount,
                "second hand": secondHandTransactionCount,
            },
            deliveries: {
                completed: completedDeliveryCount,
                pending: pendingDeliveryCount,
                personnel: deliveryPersonnelCount,
            },
            suspensions: {
                total:
                    productSuspensionCount +
                    sellerSuspensionCount +
                    userSuspensionCount,
                product: productSuspensionCount,
                seller: sellerSuspensionCount,
                user: userSuspensionCount,
            },
        });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};
