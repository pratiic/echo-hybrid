import Joi from "joi";

import { validate } from "./base.validators.js";

const replySchema = Joi.object({
    text: Joi.string().min(5).max(200).required(),
});

export const validateReply = (replyInfo) => {
    return validate(replyInfo, replySchema);
};
