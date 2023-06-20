import Joi from "joi";

import { validate } from "./base.validators.js";

const targetTypeSchema = Joi.object({
    targetType: Joi.string().allow("product", "store").required().trim(),
});

export const validateTargetType = (targetType) => {
    return validate(
        {
            targetType,
        },
        targetTypeSchema
    );
};
