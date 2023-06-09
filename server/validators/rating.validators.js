import Joi from "joi";

import { validate } from "./base.validators.js";
import { idSchema } from "./utils.js";

const ratingSchema = Joi.object({
    targetId: idSchema,
    targetType: Joi.string().allow("product", "store").required(),
    stars: Joi.valid(1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5).required(),
});

export const validateRating = (ratingInfo) => {
    return validate(ratingInfo, ratingSchema);
};
