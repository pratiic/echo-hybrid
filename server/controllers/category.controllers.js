import { notFoundHandler } from "../lib/errors.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import {
    validateCategories,
    validateCategoryName,
} from "../validators/category.validators.js";

export const addCategories = async (request, response, next) => {
    const { categories } = request.body;

    const errorMsg = validateCategories(categories);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        await prisma.category.createMany({
            data: categories,
        });

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
        next(new HttpError());
    }
};

export const requestCategory = async (request, response, next) => {
    const user = request.user;
    let name = request.query.name;

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

        await prisma.categoryRequest.create({
            data: {
                name,
                userId: user.id,
            },
        });

        response.json({ message: "category has been requested" });
    } catch (error) {
        next(new HttpError());
    }
};

export const controlCategoryRequest = async (request, response, next) => {
    const name = request.query.name;
    const action = request.query.action;

    if (action !== "accept" && action !== "reject") {
        return next(new HttpError("action is invalid"));
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
        }

        response.json({ message: `the category request has been ${action}ed` });
    } catch (error) {
        notFoundHandler(error.message, "category request", next);

        if (error.message.toLowerCase().includes("unique constraint failed")) {
            return next(new HttpError("this category already exists", 400));
        }

        next(new HttpError());
    }
};

export const deleteCategory = async (request, response, next) => {
    const name = request.query.name || "";

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
    }
};