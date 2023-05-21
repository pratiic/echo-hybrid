import prisma from "../lib/prisma.lib.js";
import { createValuesStr } from "../lib/stock.lib.js";
import { HttpError } from "../models/http-error.models.js";
import { validateProductVariants } from "../validators/stock.validators.js";
import { validateSingularStock } from "../validators/stock.validators.js";

export const setStock = async (request, response, next) => {
    const product = request.product;
    let errorMsg;
    let stockData = {
        productId: product.id,
    };

    // second hand -> no stock
    if (product.isSecondHand) {
        return next(
            new HttpError(
                "second hand products are not allowed to have a stock",
                400
            )
        );
    }

    // two stock types -> flat and varied
    if (product.stockType === "flat") {
        const { quantity } = request.body;
        errorMsg = validateSingularStock(quantity);

        if (errorMsg) {
            return next(new HttpError(errorMsg, 400));
        }

        stockData.quantity = parseInt(quantity);
    } else {
        // product variations before product stock
        if (product.variations.length === 0) {
            return next(
                new HttpError(
                    "product variations must be set before setting stock",
                    400
                )
            );
        }

        let { variants } = request.body;
        const variationLabels = product.variations.map((variation) => {
            return variation.label;
        });

        errorMsg = validateProductVariants(variants, product.variations);

        if (errorMsg) {
            return next(new HttpError(errorMsg, 400));
        }

        // shape each variant to only have variation type labels, quantity and id
        variants = variants.map((variant) => {
            const shapedVariant = {};
            const variantKeys = Object.keys(variant);
            const valuesStr = createValuesStr(variant, variationLabels); // { quantity: 1, color: "red", size: "small" } -> "redsmall"

            variantKeys.forEach((key) => {
                if (
                    variationLabels.find((label) => label === key) ||
                    key === "quantity"
                ) {
                    shapedVariant[key] = variant[key];
                    shapedVariant.id = valuesStr;
                }
            });

            return shapedVariant;
        });

        // check if any duplicate variants have been provided
        const countMap = {};

        variants.forEach((variant) => {
            const id = variant.id;
            countMap[id] = countMap[id] ? ++countMap[id] : 1;
        });

        for (let key in countMap) {
            if (countMap[key] > 1) {
                return next(new HttpError("duplicate variant provided", 400));
            }
        }

        // some of the provided variants may be the same as some of the current variants
        let currentVariants = product.stock?.variants || [];
        let indicesToDelete = "";

        if (currentVariants.length > 0) {
            const indexMap = {};

            for (let i = 0; i < currentVariants.length; i++) {
                const currentVariant = currentVariants[i];
                indexMap[currentVariant.id] = i;
            }

            variants.forEach((variant) => {
                const id = variant.id;

                if (indexMap[id] >= 0) {
                    indicesToDelete += indexMap[id];
                }
            });
        }

        // remove current variants that are the same as the provided variants
        const newCurrentVariants = [];

        for (let i = 0; i < currentVariants.length; i++) {
            if (!indicesToDelete.includes(String(i))) {
                // indicesToDelete is a string
                newCurrentVariants.push(currentVariants[i]);
            }
        }

        stockData.variants = [...newCurrentVariants, ...variants];
    }

    try {
        const createdStock = await prisma.stock.upsert({
            where: {
                productId: product.id,
            },
            update: stockData,
            create: stockData,
        });

        response.json({ stock: createdStock });
    } catch (error) {
        next(new HttpError());
    }
};
