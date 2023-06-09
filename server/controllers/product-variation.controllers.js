import { trimArrValues } from "../lib/array.lib.js";
import prisma from "../lib/prisma.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateVariations } from "../validators/product-variation.validators.js";

export const setProductVariations = async (request, response, next) => {
    const product = request.product;
    let { variations } = request.body;

    if (product.isSecondHand || product.stockType === "flat") {
        return next(
            new HttpError(
                "second hand products and products with flat stock are not allowed to have variations",
                400
            )
        );
    }

    // variations can only be set once
    if (product.variations.length > 0) {
        return next(new HttpError("product variations already set", 400));
    }

    let errorMsg = validateVariations(variations);

    if (errorMsg) {
        return next(new HttpError(errorMsg, 400));
    }

    // shape variation types to only include label and options
    variations = variations.map((type) => {
        return {
            label: type.label.trim(),
            options: trimArrValues(type.options),
            productId: product.id,
        };
    });

    try {
        await prisma.productVariation.createMany({
            data: variations,
        });

        response.json({ variations });
    } catch (error) {
        console.log(error);
        next(new HttpError());
    } finally {
        await prisma.$disconnect();
    }
};
