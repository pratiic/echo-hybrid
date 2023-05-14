import Joi from "joi";

import { validate } from "./base.validators.js";
import { getErrorMessage } from "./utils.js";

export const quantitySchema = Joi.object({
    quantity: Joi.number().integer().min(0).required(),
});

export const validateSingularStock = (quantity) => {
    return validate({ quantity }, quantitySchema);
};

export const validateProductVariants = (variants, variationTypes) => {
    if (!Array.isArray(variants) || variants.length === 0) {
        return "provide an array of variants";
    }

    const variationLabels = variationTypes.map((type) => {
        return type.label;
    });

    let error = null;

    variants.forEach((variant) => {
        const quantityValidationRes = quantitySchema.validate({
            quantity: variant.quantity,
        });

        if (quantityValidationRes.error) {
            error = getErrorMessage(quantityValidationRes);
            return;
        }

        variationLabels.forEach((label) => {
            if (!variant[label]) {
                return (error = `${label} is required`);
            }

            const options = variationTypes.find((type) => type.label === label)[
                "options"
            ];

            if (!options.find((option) => option === variant[label])) {
                error = `the value for ${label} is invalid`;
                return;
            }
        });
    });

    return error;
};
