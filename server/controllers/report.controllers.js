import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import {
    validateReport,
    validateTargetType,
} from "../validators/report.validators.js";

export const reportTarget = async (request, response, next) => {
    const user = request.user;
    const targetType = request.params.targetType;
    const targetId = parseInt(request.params.targetId) || -1;
    const { cause } = request.body;

    // validate report
    const errorMsg = validateReport({ targetType, cause });

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    const selectMap = {
        product: {
            id: true,
            store: {
                select: {
                    id: true,
                    userId: true,
                },
            },
        },
        store: {
            id: true,
        },
    };

    // check if the target exists
    const target = await prisma[targetType].findUnique({
        where: {
            id: targetId,
        },
        select: selectMap[targetType],
    });

    if (!target) {
        return next(new HttpError(`${targetType} not found`, 404));
    }

    // cannot report one's own product
    if (targetType === "product") {
        if (user.id === target.store?.userId) {
            return next(
                new HttpError("you cannot report your own product", 400)
            );
        }
    }

    // cannot report one's own seller profile
    if (targetType === "store") {
        if (user.store?.id === target.id) {
            return next(
                new HttpError("you cannot report your own seller profile", 400)
            );
        }
    }

    // cannot report oneself
    if (targetType === "user") {
        if (user.id === target.id) {
            return next(new HttpError("you cannot report yourself"));
        }
    }

    const reportData = {
        creatorId: user.id,
        cause: cause.trim(),
        [`${targetType}Id`]: targetId,
    };

    try {
        const createdReport = await prisma.report.create({
            data: reportData,
        });

        response.json({ report: createdReport });
    } catch (error) {
        if (error.message.toLowerCase().includes("unique constraint failed")) {
            return next(
                new HttpError(
                    `you have already reported this ${targetType}`,
                    400
                )
            );
        }

        next(new HttpError());
    }
};

export const getReports = async (request, response, next) => {
    const page = request.query.page || 1;
    const targetType = request.query.targetType || "";
    const PAGE_SIZE = 15;
    let filter = {};

    if (targetType) {
        const errorMsg = validateTargetType(targetType);

        if (errorMsg) {
            return next(new HttpError(errorMsg, 400));
        }

        filter = {
            NOT: {
                [`${targetType}Id`]: null,
            },
        };
    }

    try {
        const reports = await prisma.report.findMany({
            where: filter,
            take: PAGE_SIZE,
            skip: (page - 1) * PAGE_SIZE,
            orderBy: {
                createdAt: "asc",
            },
        });

        response.json({ reports });
    } catch (error) {
        next(new HttpError());
    }
};
