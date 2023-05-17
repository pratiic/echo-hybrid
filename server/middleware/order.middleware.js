import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";

export const validateOrder = async (request, response, next) => {
    const orderId = parseInt(request.params.orderId) || 0;

    try {
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
            },
            select: request.select,
        });

        if (!order) {
            return next(new HttpError("order not found", 404));
        }

        request.order = order;
        next();
    } catch (error) {
        next(new HttpError());
    }
};
