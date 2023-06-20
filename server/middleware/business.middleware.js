import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";

export const validateBusiness = async (request, response, next) => {
    const businessId = parseInt(request.params.businessId) || -1;

    try {
        const business = await prisma.business.findUnique({
            where: {
                id: businessId,
            },
            select: {
                id: true,
                store: {
                    select: {
                        id: true,
                        userId: true,
                    },
                },
                ...(request.selectionFilter || {}),
            },
        });

        if (!business) {
            return next(new HttpError("business not found", 404));
        }

        request.business = business;
        next();
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};
