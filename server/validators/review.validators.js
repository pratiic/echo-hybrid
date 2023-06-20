import Joi from "joi";

import { validate } from "./base.validators.js";
import { idSchema } from "./utils.js";

const reviewSchema = Joi.object({
    targetType: Joi.string().allow("product", "store").required().trim(),
    targetId: idSchema,
    text: Joi.string().min(5).max(200).required().trim(),
});

export const validateReview = (reviewInfo) => {
    return validate(reviewInfo, reviewSchema);
};
