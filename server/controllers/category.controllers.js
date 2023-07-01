import { genericUserFields } from "../lib/data-source.lib.js";
import { notFoundHandler } from "../lib/errors.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import {
    validateCategories,
    validateCategoryName,
} from "../validators/category.validators.js";

export const addCategories = async (request, response, next) => {
    let { categories } = request.body;

    const errorMsg = validateCategories(categories);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    categories = categories.map((category) => {
        return { name: category.name.toLowerCase().trim() };
    });

    try {
        await Promise.all([
            prisma.category.createMany({
                data: categories,
                where: {
                    name: {
                        in: categories.map((category) => category.name),
                    },
                },
            }),
        ]);

        response.json({ categories });
    } catch (error) {
        if (error.message.toLowerCase().includes("unique constraint failed")) {
            return next(
                new HttpError(
                    "one or more of the provided categories already exist",
                    400
                )
            );
        }

        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const getCategories = async (request, response, next) => {
    try {
        const categories = await prisma.category.findMany({
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
            orderBy: [
                {
                    name: "asc",
                },
            ],
        });

        response.json({ categories });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const requestCategory = async (request, response, next) => {
    const user = request.user;
    let name = request.query.name;
    const io = request.io;

    const errorMsg = validateCategoryName(name);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        name = name.trim().toLowerCase();

        const [existingCategory, existingCategoryRequest] = await Promise.all([
            prisma.category.findUnique({
                where: {
                    name,
                },
            }),
            prisma.categoryRequest.findUnique({
                where: {
                    name,
                },
            }),
        ]);

        if (existingCategory) {
            return next(new HttpError("this category already exists", 400));
        }

        if (existingCategoryRequest) {
            return next(
                new HttpError("this category has already been requested", 400)
            );
        }

        const requestedCategory = await prisma.categoryRequest.create({
            data: {
                name,
                userId: user.id,
            },
            include: {
                user: {
                    select: genericUserFields,
                },
            },
        });

        io.emit("category-request", requestedCategory);

        response.json({ message: "category has been requested" });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const controlCategoryRequest = async (request, response, next) => {
    const name = request.query.name;
    const action = request.query.action;
    const io = request.io;

    if (action !== "accept" && action !== "reject") {
        return next(new HttpError("action is invalid", 400));
    }

    const errorMsg = validateCategoryName(name);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        await prisma.categoryRequest.delete({
            where: {
                name,
            },
        });

        if (action === "accept") {
            await prisma.category.create({
                data: {
                    name,
                },
            });

            io.emit("category-request-accept");
        }

        response.json({ message: `the category request has been ${action}ed` });
    } catch (error) {
        notFoundHandler(error.message, "category request", next);

        if (error.message.toLowerCase().includes("unique constraint failed")) {
            return next(new HttpError("this category already exists", 400));
        }

        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const acknowledgeRequests = async (request, response, next) => {
    try {
        await prisma.categoryRequest.updateMany({
            where: {
                isAcknowledged: false,
            },
            data: {
                isAcknowledged: true,
            },
        });

        response.json({ message: "acknowledged" });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const deleteCategory = async (request, response, next) => {
    const name = request.params.categoryName;

    try {
        const category = await prisma.category.findUnique({
            where: {
                name,
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!category) {
            return next(new HttpError("category not found", 404));
        }

        if (category._count.products > 0) {
            return next(
                new HttpError(
                    "a category must have no product associated with it to be deleted",
                    400
                )
            );
        }

        await prisma.category.delete({
            where: {
                name,
            },
        });

        response.json({
            message: "category has been deleted",
        });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const getCategoryRequests = async (request, response, next) => {
    try {
        const requests = await prisma.categoryRequest.findMany({
            where: {},
            include: {
                user: {
                    select: genericUserFields,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        response.json({ requests });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};
