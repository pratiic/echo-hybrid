import { HttpError } from "../models/http-error.models.js";
import prisma from "../lib/prisma.lib.js";
import {
    deliveryInclusionFields,
    genericUserFields,
} from "../lib/data-source.lib.js";

export const getDeliveries = async (request, response, next) => {
    const user = request.user;
    const page = request.query.page || 1;
    let skip = parseInt(request.query.skip);
    const searchQuery = request.query.query;
    const PAGE_SIZE = 10;

    console.log(skip);

    if (skip < 1) {
        skip = 0;
    }

    let searchFilter = {};

    if (searchQuery) {
        searchFilter = {
            OR: [
                {
                    order: {
                        product: {
                            name: {
                                contains: searchQuery.trim(),
                                mode: "insensitive",
                            },
                        },
                    },
                },
                {
                    order: {
                        id: {
                            equals: parseInt(searchQuery.trim()) || -1,
                        },
                    },
                },
            ],
        };
    }

    const whereObj = {
        NOT: {
            deletedFor: {
                has: user.id,
            },
        },
        ...searchFilter,
    };

    try {
        const [deliveries, totalCount] = await Promise.all([
            prisma.delivery.findMany({
                where: whereObj,
                include: deliveryInclusionFields,
                orderBy: {
                    createdAt: "desc",
                },
                take: PAGE_SIZE,
                skip: (page - 1) * PAGE_SIZE + skip,
            }),
            prisma.delivery.count({
                where: whereObj,
            }),
        ]);

        response.json({ deliveries, totalCount });
    } catch (error) {
        console.log(error);

        next(new HttpError());
    }
};

export const deleteDelivery = async (request, response, next) => {
    // delete a delivery for the requesting user
    const user = request.user;
    const deliveryId = parseInt(request.params.deliveryId) || -1;

    try {
        await prisma.delivery.update({
            where: {
                id: deliveryId,
            },
            data: {
                deletedFor: {
                    push: user.id,
                },
            },
        });

        response.json({ message: "the delivery has been deleted for you" });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};

export const acknowledgeDeliveries = async (request, response, next) => {
    try {
        await prisma.delivery.updateMany({
            where: {},
            data: {
                isAcknowledged: true,
            },
        });

        response.json({});
    } catch (error) {
        next(new HttpError());
    }
};
