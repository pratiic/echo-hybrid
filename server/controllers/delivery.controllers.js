import { HttpError } from "../models/http-error.models.js";
import prisma from "../lib/prisma.lib.js";

export const getOrdersToDeliver = async (request, response, next) => {
    // orders whose status is PACKAGED -> ready to be delivered
    try {
        const orders = await prisma.order.findMany({
            where: {
                status: "PACKAGED",
                isDelivered: true,
            },
            orderBy: {
                updatedAt: "asc",
            },
        });

        response.json({
            orders,
        });
    } catch (error) {
        return next(new HttpError());
    }
};
