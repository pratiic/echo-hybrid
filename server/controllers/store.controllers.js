import { genericUserFields } from "../lib/data-source.lib.js";
import { notFoundHandler } from "../lib/errors.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateStoreType } from "../validators/store.validators.js";

export const registerStore = async (request, response, next) => {
    const user = request.user;
    const storeType = request.query.type; // IND for Individual or BUS for Business

    const errorMsg = validateStoreType(storeType);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        // one user -> only one store
        const userStore = await prisma.store.findUnique({
            where: { userId: user.id },
        });

        if (userStore) {
            return next(
                new HttpError(
                    "a store is already associated with your account",
                    400
                )
            );
        }

        const createdStore = await prisma.store.create({
            data: {
                storeType,
                userId: user.id,
            },
        });

        response.status(201).json({ store: createdStore });
    } catch (error) {
        next(new HttpError());
    }
};

export const getStoreDetails = async (request, response, next) => {
    const storeId = parseInt(request.params.storeId) || 0;

    try {
        const store = await prisma.store.findUnique({
            where: {
                id: storeId,
            },
            include: {
                user: {
                    select: { ...genericUserFields, address: true },
                },
                business: {
                    include: {
                        address: true,
                    },
                },
                ratings: true,
            },
        });

        if (!store) {
            return next(new HttpError("seller not found", 404));
        }

        // check if the business has been verified
        if (store.storeType === "BUS" && !store.business.isVerified) {
            return next(
                new HttpError(
                    "the business of this seller has not been verified yet"
                )
            );
        }

        response.json({ store });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};

export const deleteStore = async (request, response, next) => {
    const user = request.user;

    try {
        await prisma.store.delete({ where: { userId: user.id } });

        response.json({ message: "the store has been deleted" });
    } catch (error) {
        notFoundHandler(error.message, "store", next);
        next(new HttpError());
    }
};
