import {
    genericUserFields,
    productDeletionFields,
} from "../lib/data-source.lib.js";
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
                suspension: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!store) {
            return next(new HttpError("seller not found", 404));
        }

        if (store.isDeleted) {
            return next(new HttpError("the seller has been deleted", 404));
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

export const getStores = async (request, response, next) => {
    const user = request.user;
    user.address = user.address || {};
    const filter = request.query.filter || "all";
    const searchQuery = request.query.query || "";
    const page = parseInt(request.query.page) || 1;
    const PAGE_SIZE = 15;

    const getAddressFilter = (field) => {
        return {
            OR: [
                {
                    storeType: "IND",
                    user: {
                        address: {
                            [field]: user.address[field],
                        },
                    },
                },
                {
                    storeType: "BUS",
                    business: {
                        address: {
                            [field]: user.address[field],
                        },
                    },
                },
            ],
        };
    };

    const filterMap = {
        all: {},
        province: getAddressFilter("province"),
        city: getAddressFilter("city"),
        area: getAddressFilter("area"),
    };

    let searchFilter = {};

    if (searchQuery) {
        const genericObj = {
            contains: searchQuery.trim(),
            mode: "insensitive",
        };

        searchFilter = {
            OR: [
                {
                    storeType: "IND",
                    user: {
                        fullName: genericObj,
                    },
                },
                {
                    storeType: "BUS",
                    business: {
                        name: genericObj,
                    },
                },
            ],
        };
    }

    const whereObj = {
        ...filterMap[filter],
        ...searchFilter,
        isDeleted: false,
        NOT: {
            // do not get the requesting user's own store
            user: {
                id: request.user.id,
            },
        },
        suspension: null,
    };

    try {
        const [stores, totalCount] = await Promise.all([
            prisma.store.findMany({
                where: whereObj,
                orderBy: {
                    rating: "desc",
                },
                include: {
                    user: {
                        select: {
                            ...genericUserFields,
                            address: true,
                        },
                    },
                    business: {
                        include: {
                            address: true,
                        },
                    },
                },
                take: PAGE_SIZE,
                skip: (page - 1) * PAGE_SIZE,
            }),
            prisma.store.count({
                where: whereObj,
            }),
        ]);

        response.json({ stores, totalCount });
    } catch (error) {
        console.log(error);
        return next(new HttpError());
    }
};

export const deleteStore = async (request, response, next) => {
    const user = request.user;
    const store = user.store;
    const io = request.io;

    if (!store) {
        return next(new HttpError("you are not registered as a seller", 404));
    }

    const operations = [
        prisma.store.update({
            where: {
                id: store.id,
            },
            data: {
                isDeleted: true,
                userId: null,
            },
        }),
        prisma.product.updateMany({
            where: {
                storeId: store.id,
            },
            data: productDeletionFields,
        }),
        ...["review", "rating"].map((model) => {
            return prisma[model].deleteMany({
                where: {
                    storeId: store.id,
                },
            });
        }),
    ];

    if (store.business) {
        operations.push(
            prisma.business.delete({
                where: {
                    storeId: store.id,
                },
            })
        );
    }

    try {
        await prisma.$transaction(async () => {
            await Promise.all(operations);
        });

        io.emit("seller-delete", store.id);

        response.json({ message: "the store has been deleted" });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    }
};
