import Joi from "joi";

import { validate } from "./base.validators.js";
import { idSchema } from "./utils.js";

const ratingSchema = Joi.object({
    targetId: idSchema,
    targetType: Joi.string().allow("product", "store").required(),
    stars: Joi.number().integer().positive().valid(1, 2, 3, 4, 5).required(),
});

export const validateRating = (ratingInfo) => {
    return validate(ratingInfo, ratingSchema);
};
