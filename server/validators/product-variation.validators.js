import Joi from "joi";
import { validate } from "./base.validators.js";

const labelSchema = Joi.object({
    label: Joi.string().min(3).max(15).required().trim(),
});
const optionSchema = Joi.object({
    option: Joi.string().required().max(15),
});

const validateLabel = (label) => {
    if (label.toLowerCase().trim() === "quantity") {
        return "'Quantity' as label is not allowed, try 'Qty' instead";
    }

    return validate({ label }, labelSchema);
};

const validateOption = (option) => {
    return validate({ option }, optionSchema);
};

export const validateVariations = (variations) => {
    // variations -> array of atleast one element
    if (!Array.isArray(variations)) {
        return "variations must be an array";
    }

    if (variations.length === 0) {
        return "provide atleast one variation";
    }

    for (let variation of variations) {
        const { label, options } = variation;

        // variation -> { label: string, options: array of atleast 2 strings }

        // validate label
        let errorMsg = validateLabel(label, labelSchema);

        if (errorMsg) {
            return errorMsg;
        }

        // validate options
        if (!Array.isArray(options)) {
            return "options must be an array";
        }

        if (options.length < 2) {
            return `provide atleast two options for ${label}`;
        }

        // validate each option
        for (let option of options) {
            errorMsg = validateOption(option, optionSchema);

            if (errorMsg) {
                return errorMsg;
            }
        }
    }
};
