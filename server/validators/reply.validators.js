import Joi from "joi";

import { validate } from "./base.validators.js";
import { idSchema } from "./utils.js";

const replySchema = Joi.object({
    reviewId: idSchema,
    text: Joi.string().min(5).max(200).required(),
});

export const validateReply = (replyInfo) => {
    return validate(replyInfo, replySchema);
};
