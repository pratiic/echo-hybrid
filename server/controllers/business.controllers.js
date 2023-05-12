import { prepareImageData } from "../lib/image.lib.js";
import prisma from "../lib/prisma.lib.js";
import { trimValues } from "../lib/strings.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateBusiness } from "../validators/business.validators.js";

export const requestRegistration = async (request, response, next) => {
    const user = request.user;
    const businessInfo = request.body;

    const errorMsg = validateBusiness(businessInfo);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
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

        if (!request.file) {
            return next(
                new HttpError(
                    "a business registration cerification image must be provided",
                    400
                )
            );
        }

        let { name, ownerName, PAN, phone } = businessInfo;
        [name, ownerName, PAN, phone] = trimValues(name, ownerName, PAN, phone);

        const createdBusiness = await prisma.business.create({
            data: {
                name,
                ownerName,
                PAN,
                phone,
                storeId: store.id,
            },
        });

        // handle business registration certificate image
        const imageData = prepareImageData(
            "business",
            createdBusiness.id,
            request.file
        );

        const [, updatedBusiness] = await Promise.all([
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
        ]);

        response.json({
            business: updatedBusiness,
        });
    } catch (error) {
        next(new HttpError());
    }
};
