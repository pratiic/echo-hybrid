import { suspensionInclusionFields } from "../lib/data-source.lib.js";
import { sendEmail } from "../lib/email.lib.js";
import prisma from "../lib/prisma.lib.js";
import { capitalizeFirstLetter } from "../lib/strings.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateTargetType } from "../validators/report.validators.js";
import { validateSuspension } from "../validators/suspension.validators.js";

export const controlSuspension = async (request, response, next) => {
    const targetType = request.params.targetType;
    const targetId = parseInt(request.params.targetId) || -1;
    const action = request.query.action;
    const io = request.io;
    const { cause } = request.body;

    // validate suspension
    const errorMsg = validateSuspension({ targetType, cause, action });

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    const selectMap = {
        product: {
            store: {
                select: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                        },
                    },
                },
            },
            name: true,
            isDeleted: true,
        },
        store: {
            user: {
                select: {
                    id: true,
                    email: true,
                },
            },
        },
        user: {
            email: true,
        },
    };

    // check if the target exists
    const target = await prisma[targetType].findUnique({
        where: {
            id: targetId,
        },
        select: {
            id: true,
            suspension: { select: { id: true } },
            ...(selectMap[targetType] || {}),
        },
    });

    if (!target || target.isDeleted) {
        return next(new HttpError(`${targetType} not found`, 404));
    }

    if (action === "suspend" && target.suspension) {
        return next(
            new HttpError(`the ${targetType} is already suspended`, 400)
        );
    }

    if (action === "reinstate" && !target.suspension) {
        return next(new HttpError(`the ${targetType} is not suspended`, 400));
    }

    const operations = [];

    if (action === "suspend") {
        operations.push(
            prisma.suspension.create({
                data: {
                    cause: cause.trim(),
                    targetType,
                    [`${targetType}Id`]: targetId,
                },
                include: suspensionInclusionFields,
            })
        );
        operations.push(
            prisma.report.deleteMany({
                where: {
                    [`${targetType}Id`]: targetId,
                },
            })
        );
    } else {
        operations.push(
            prisma.suspension.delete({
                where: {
                    [`${targetType}Id`]: targetId,
                },
            })
        );
    }

    try {
        const results = await Promise.all(operations);

        // send email to affected party
        let recipientEmail = "",
            subject = "",
            text = `we are ${
                action === "suspend" ? "sorry" : "happy"
            } to inform that `;

        switch (targetType) {
            case "product":
                recipientEmail = target.store.user.email;
                subject = "product";
                text += `your product - ${capitalizeFirstLetter(
                    target.name
                )} - has been`;
                break;
            case "store":
                recipientEmail = target.user.email;
                subject = "seller profile";
                text += "your seller profile has been";
                break;
            case "user":
                recipientEmail = target.email;
                subject = "account";
                text += "your account on Echo has been";
                break;
        }
        subject += action === "suspend" ? " suspension" : " reinstatement";
        text +=
            action === "suspend"
                ? ` suspended. The reason for the suspension:\n${capitalizeFirstLetter(
                      cause
                  )}.`
                : " reinstated.";

        sendEmail(recipientEmail, subject, text);

        if (action === "suspend") {
            io.emit(`${targetType}-suspension`, {
                targetType,
                targetId,
            });
        }

        const res =
            action === "suspend"
                ? { suspension: results[0] }
                : { message: `the ${targetType} has been reinstated` };

        response.json(res);
    } catch (error) {
        console.log(error);

        next(new HttpError());
    }
};

export const getSuspensions = async (request, response, next) => {
    const targetType = request.query.targetType || "";
    const searchQuery = request.query.query;
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

    if (searchQuery && targetType) {
        // if targetType not defined -> not clear which targetType to search for since only the id is provided
        filter = {
            ...filter,
            [`${targetType}Id`]: {
                equals: parseInt(searchQuery.trim()) || -1,
            },
        };
    }

    try {
        const suspensions = await prisma.suspension.findMany({
            where: filter,
            include: suspensionInclusionFields,
            orderBy: {
                createdAt: "desc",
            },
        });

        response.json({
            suspensions,
        });
    } catch (error) {
        console.log(error);

        next(new HttpError());
    }
};
