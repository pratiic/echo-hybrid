import Joi from "joi";

import { validate } from "./base.validators.js";

const getMessageSchema = (hasImage) => {
    return Joi.object({
        text: hasImage ? Joi.string().allow("") : Joi.string().required(),
    });
};

export const validateMessage = (messageInfo, hasImage) => {
    // if image provided -> text is not required
    return validate(messageInfo, getMessageSchema(hasImage));
};
