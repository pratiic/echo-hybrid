import Joi from "joi";

import { validate } from "./base.validators.js";

export const quantitySchema = Joi.object({
    quantity: Joi.number().integer().min(0).required(),
});

export const validateSingularStock = (quantity) => {
    return validate({ quantity }, quantitySchema);
};

export const validateProductVariants = (variants, variations) => {
    // variants -> array of atleast one variant
    if (!Array.isArray(variants) || variants.length === 0) {
        return "provide an array of variants";
    }

    const variationLabels = variations.map((variation) => {
        return variation.label;
    });

    let errorMsg = "";

    variants.forEach((variant) => {
        // validate variation quantity
        errorMsg = validate({ quantity: variant.quantity }, quantitySchema);

        if (errorMsg) {
            return (errorMsg = errorMsg);
        }

        variationLabels.forEach((label) => {
            // check if each label is provided -> color, size, etc
            if (!variant[label]) {
                return (errorMsg = `${label} is required`);
            }

            // validate provided option for each label
            // label -> color, then option may be red, blue, etc
            const options = variations.find(
                (variation) => variation.label === label
            )["options"];

            if (!options.find((option) => option === variant[label])) {
                return (errorMsg = `the value for ${label} is invalid`);
            }
        });
    });

    return errorMsg;
};
