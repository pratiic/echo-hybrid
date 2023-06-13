import { businessInclusionFields } from "../lib/data-source.lib.js";
import prisma from "../lib/prisma.lib.js";
import { trimValues } from "../lib/strings.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateAddress } from "../validators/address.validators.js";

export const setAddress = async (request, response, next) => {
    const user = request.user;
    let addressInfo = request.body;
    const targetType = request.params.targetType;
    const io = request.io;

    // validate target type
    if (targetType !== "user" && targetType !== "business") {
        return next(new HttpError("invalid target type", 400));
    }

    // no business -> cannot set business address
    if (targetType === "business" && !user.store?.business) {
        return next(
            new HttpError("you need to register a business first", 400)
        );
    }

    // in case of updating
    let currentAddress =
        (targetType === "user"
            ? user.address
            : user.store?.business?.address) || {};
    const errorMsg = validateAddress({ ...currentAddress, ...addressInfo });

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    try {
        const selectionFilter = {
            [`${targetType}Id`]:
                targetType === "user" ? user.id : user.store.business.id,
        };

        let { province, city, area, description } = addressInfo;
        [province, city, area, description] = trimValues(
            province,
            city,
            area,
            description
        );
        addressInfo = {
            province: province || currentAddress.province,
            city: city || currentAddress.city,
            area: area || currentAddress.area,
            description:
                description === undefined
                    ? ""
                    : description || currentAddress.description,
            ...selectionFilter,
        };

        const address = await prisma.address.upsert({
            where: selectionFilter,
            create: addressInfo,
            update: addressInfo,
        });

        if (targetType === "business") {
            // targetType -> business means new business registration request
            const business = await prisma.business.findUnique({
                where: {
                    id: user.store.business.id,
                },
                include: businessInclusionFields,
            });

            io.emit("business-request", business);
        }

        response.json({ address });
    } catch (error) {
        next(new HttpError());
    }
};
