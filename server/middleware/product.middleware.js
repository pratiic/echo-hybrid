import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";

export const validateProduct = async (request, response, next) => {
    const user = request.user;
    const productId = parseInt(request.params.productId) || -1;

    try {
        // check if the product exists
        const product = await prisma.product.findUnique({
            where: {
                id: productId,
            },
            include: {
                store: {
                    select: {
                        id: true,
                        userId: true,
                    },
                },
                ...(request.inclusionFields || {}),
            },
        });

        if (!product || !product.storeId) {
            return next(new HttpError("product not found", 404));
        }

        if (request.validateSeller) {
            // only the owner of a product is allowed to make changes to it
            if (product.store.userId !== user.id) {
                return next(
                    new HttpError(
                        "you are not allowed to make changes to this product",
                        401
                    )
                );
            }
        }

        request.product = product;
        next();
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};
