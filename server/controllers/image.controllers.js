import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";

export const getImage = async (request, response, next) => {
    const { type, id, uni } = request.query;
    let image = null;

    let filter = {
        [`${type}Id`]: Number(id),
    };

    try {
        image = await prisma.image.findUnique({
            where: filter,
        });

        if (!image) {
            return next(new HttpError("image not found", 404));
        }

        response.send(image.binary);
    } catch (error) {
        next(new HttpError());
    }
};
