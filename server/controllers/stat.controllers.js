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
            activeProductCount,
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
            prisma.product.count({
                where: {
                    isDeleted: false,
                    stockType: "varied",
                    NOT: {
                        stock: null,
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
            ...["placed", "cancelled", "confirmed", "rejected", "packaged"].map(
                (status) => {
                    return prisma.order.count({
                        where: getOrderFilter(status),
                    });
                }
            ),
        ]);

        response.json({
            product: {
                total: productCount,
                secondHand: secondHandProductCount,
                brandNew: productCount - secondHandProductCount,
                active: activeProductCount,
            },
            seller: {
                total: sellerCount,
                business: {
                    total: busSellerCount,
                    verified: verifiedBusSellerCount,
                    unverified: busSellerCount - verifiedBusSellerCount,
                },
                individual: sellerCount - busSellerCount,
            },
            user: {
                total: userCount,
                verified: verifiedUserCount,
                unverified: userCount - verifiedUserCount,
                deliveryPersonnel: deliveryPersonnelCount,
            },
            order: {
                total: orderCount,
                placed: placedOrderCount,
                cancelled: cancelledOrderCount,
                confirmed: confirmedOrderCount,
                rejected: rejectedOrderCount,
                packaged: packagedOrderCount,
            },
        });
    } catch (error) {
        next(new HttpError());
    }
};
