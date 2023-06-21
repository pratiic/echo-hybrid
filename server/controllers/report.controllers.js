import {
    genericUserFields,
    reportInclusionFields,
} from "../lib/data-source.lib.js";
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
    const io = request.io;
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
        review: {
            id: true,
            user: {
                select: {
                    id: true,
                },
            },
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
            return next(new HttpError("you cannot report yourself", 400));
        }
    }

    // cannot report one's own review
    if (targetType === "review") {
        if (user.id === target.user.id) {
            return next(
                new HttpError("you cannot report your own review", 400)
            );
        }
    }

    const reportData = {
        cause: cause.trim(),
        targetType,
        [`${targetType}Id`]: targetId,
        creatorId: user.id,
    };

    try {
        const createdReport = await prisma.report.create({
            data: reportData,
            include: reportInclusionFields,
        });

        io.emit("target-report", {
            targetType: targetType === "store" ? "seller" : targetType,
            report: createdReport,
        });

        response.status(201).json({ report: createdReport });
    } catch (error) {
        console.log(error);

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
        const [reports, totalCount] = await Promise.all([
            prisma.report.findMany({
                where: filter,
                take: PAGE_SIZE,
                skip: (page - 1) * PAGE_SIZE,
                orderBy: {
                    createdAt: "desc",
                },
                include: reportInclusionFields,
            }),
            prisma.report.count({
                where: filter,
            }),
        ]);

        response.json({ reports, totalCount });
    } catch (error) {
        next(new HttpError());
    }
};

export const deleteReport = async (request, response, next) => {
    const reportId = parseInt(request.params.reportId) || -1;

    try {
        await prisma.report.delete({
            where: {
                id: reportId,
            },
        });

        response.json({ message: "the report has been deleted" });
    } catch (error) {
        if (
            error.message
                .toLowerCase()
                .includes("record to delete does not exist")
        ) {
            return next(new HttpError("the report does not exist", 404));
        }

        next(new HttpError());
    }
};

export const acknowledgeReports = async (request, response, next) => {
    try {
        await prisma.report.updateMany({
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
    }
};
