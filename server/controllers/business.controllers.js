import { businessInclusionFields } from "../lib/data-source.lib.js";
import { sendEmail } from "../lib/email.lib.js";
import { prepareImageData } from "../lib/image.lib.js";
import prisma from "../lib/prisma.lib.js";
import { capitalizeFirstLetter, trimValues } from "../lib/strings.lib.js";
import { HttpError } from "../models/http-error.models.js";
import {
    validateBusiness,
    validateBusinessRegistrationControl,
} from "../validators/business.validators.js";

export const registerBusiness = async (request, response, next) => {
    const user = request.user;
    const businessInfo = request.body;
    const io = request.io;

    const errorMsg = validateBusiness(businessInfo, request.file);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        await prisma.$transaction(async (prisma) => {
            const store = await prisma.store.findUnique({
                where: { userId: user.id },
                include: {
                    business: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

            // can sell only after registering as a seller
            if (!store) {
                return next(
                    new HttpError("you need to register as a seller first", 400)
                );
            }

            // must have a store of type BUS
            if (store.storeType === "IND") {
                return next(
                    new HttpError(
                        "you are already registered as an individual seller",
                        400
                    )
                );
            }

            // one account -> only one business
            if (store.business) {
                return next(
                    new HttpError(
                        "there is already a business registered with this account",
                        400
                    )
                );
            }

            let { name, PAN, phone, province, city, area, description } =
                businessInfo;
            [name, PAN, phone, province, city, area, description] = trimValues(
                name,
                PAN,
                phone,
                province,
                city,
                area,
                description
            );

            const createdBusiness = await prisma.business.create({
                data: {
                    name,
                    PAN,
                    phone,
                    storeId: store.id,
                },
            });

            // handle business registration certificate image and create business address
            const imageData = prepareImageData(
                "business",
                createdBusiness.id,
                request.file
            );

            const [, updatedBusiness, createdAddress] = await Promise.all([
                prisma.image.create({
                    data: imageData,
                }),
                prisma.business.update({
                    where: {
                        id: createdBusiness.id,
                    },
                    data: {
                        regImage: imageData.src,
                    },
                }),
                prisma.address.create({
                    data: {
                        province,
                        city,
                        area,
                        description,
                        businessId: createdBusiness.id,
                    },
                }),
            ]);

            io.emit("business-request", {
                ...updatedBusiness,
                address: createdBusiness,
            });

            response.status(201).json({
                business: { ...updatedBusiness, address: createdAddress },
            });
        });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const getBusinessDetails = async (request, response, next) => {
    const user = request.user;
    let businessId = parseInt(request.params.businessId);

    if (businessId === 0) {
        // own business
        const ownBusinessId = user.store?.business?.id;

        if (!ownBusinessId) {
            return next(
                new HttpError("you have not registered a business", 404)
            );
        }
        businessId = ownBusinessId;
    }

    try {
        const business = await prisma.business.findUnique({
            where: {
                id: businessId,
            },
            include: {
                address: true,
            },
        });

        if (!business) {
            return next(new HttpError("business not found", 404));
        }

        response.json({ business });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

// accept or reject a business
export const controlBusinessRegistration = async (request, response, next) => {
    const business = request.business;
    const action = request.query.action;
    const { cause } = request.body;
    const io = request.io;

    if (business.isVerified) {
        return next(
            new HttpError("the business has already been verified", 400)
        );
    }

    const errorMsg = validateBusinessRegistrationControl({ action, cause });

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    let operation = null;

    if (action === "accept") {
        operation = prisma.business.update({
            where: {
                id: business.id,
            },
            data: {
                isVerified: true,
            },
        });
    } else {
        // if store is deleted, business is automatically deleted
        operation = prisma.store.deleteMany({
            // delete would not work
            where: {
                business: {
                    id: business.id,
                },
            },
        });
    }

    try {
        await operation;

        // send email to business owner
        const recipientEmail = business.store.user.email;
        const subject = "business registration";
        const text =
            action === "accept"
                ? "Congratulations, the business you had registered on Echo has been verified. You can start selling products on Echo now."
                : `We are sorry to inform that the business you had registered on Echo has been rejected. The reason for rejection: \n${capitalizeFirstLetter(
                      cause
                  )}.`;

        sendEmail(recipientEmail, subject, text);

        io.emit(`business-request-${action}`, business.id);

        response.json({
            message: `the business has been ${
                action === "accept" ? "verified" : "rejected and thus deleted"
            }`,
        });
    } catch (error) {
        console.log(error);

        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const updateBusiness = async (request, response, next) => {
    const business = request.business;
    const updateInfo = request.body;

    if (business.status === "ACCEPTED") {
        return next(
            new HttpError(
                "a business cannot be updated after it is accepted",
                400
            )
        );
    }

    const errorMsg = validateBusiness({ ...business, ...updateInfo });

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        const { name, PAN, phone } = updateInfo;

        const updatedBusiness = await prisma.business.update({
            where: {
                id: business.id,
            },
            data: {
                name: name || business.name,
                PAN: PAN || business.PAN,
                phone: phone || business.phone,
            },
        });

        response.json({ business: updatedBusiness });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const deleteBusiness = async (request, response, next) => {
    const user = request.user;
    const business = request.business;
    const io = request.io;

    if (business.store.userId !== user.id) {
        return next(
            new HttpError("only the owner is allowed to delete a business", 401)
        );
    }

    try {
        await Promise.all([
            prisma.business.delete({
                where: {
                    id: business.id,
                },
            }),
            prisma.store.delete({
                where: {
                    userId: user.id,
                },
            }),
        ]);

        if (!business.isVerified) {
            // business registration cancellation
            io.emit("business-registation-cancellation", business.id);
        }

        response.json({
            message: "business has been deleted",
        });
    } catch (error) {
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const getBusinessRequests = async (request, response, next) => {
    // business registration requests for the admin to accept or reject
    const page = request.query.page || 1;
    let skip = parseInt(request.query.skip) || 0;
    const PAGE_SIZE = 10;

    if (skip < 0) {
        skip = 0;
    }

    const whereObj = {
        isVerified: false,
        NOT: {
            address: null,
        },
    };

    try {
        const [requests, totalCount] = await Promise.all([
            prisma.business.findMany({
                where: whereObj,
                include: businessInclusionFields,
                orderBy: {
                    updatedAt: "desc",
                },
                take: PAGE_SIZE,
                skip: (page - 1) * PAGE_SIZE + skip,
            }),
            prisma.business.count({
                where: whereObj,
            }),
        ]);

        response.json({ requests, totalCount });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};

export const acknowledgedBusinessRequests = async (request, response, next) => {
    try {
        await prisma.business.updateMany({
            where: {
                isAcknowledged: false,
            },
            data: {
                isAcknowledged: true,
            },
        });

        response.json({});
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};
